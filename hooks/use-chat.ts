"use client"

import { useParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import { db } from "@/db";
import { chats as chatsTable } from "@/db/schema";
import { aiService } from "@/services/ai-service";
import { useAIModelStore } from "@/store/ai-model-store";
import { useChatInputStore } from "@/store/chat-store";
import { useComposerStore } from "@/store/composer-store";
// import { sanitizeForDrizzle, validateMessage, stripPrefixes } from "@/lib/utils";
import type { Message } from "@/types/chat";

const MIN_HEIGHT = 48;
type Params = { slug: string };

export function useChat() {
  const params = useParams<Params>() ?? { slug: "" };
  const [testChatId] = useState<string>(() => uuidv4());
  const chatIdParam = params.slug || testChatId;

  const [user, setUser] = useState<any>(null);
  const [guestUserId, setGuestUserId] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [initialResponseGenerated, setInitialResponseGenerated] = useState(false);
  const textBufferRef = useRef("");
  const updateScheduledRef = useRef(false);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const { currentModel, setModel, isSwitching, forceSetModel } = useAIModelStore();
  const { chatState, setChatState, chatId, setChatId, setShowThinking } = useChatInputStore();
  const { setValue, setOnSubmit, setHandleInsertText, setHandleUrlAnalysis, setHandleAIGenerate, textareaRef } = useComposerStore();

  const ensureUserExists = useCallback(async (userId: string) => {
    try {
      const { user: userTable } = await import("@/db/schema");
      const userExists = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.id, userId)).then(rows => rows.length > 0);
      if (!userExists) {
        await db.insert(userTable).values({ id: userId, name: "Guest User", email: `${userId}@example.com`, isAnonymous: true });
      }
      return true;
    } catch (error) {
      console.error("Failed to ensure user exists:", error);
      return false;
    }
  }, []);

  const createChatIfNotExists = useCallback(async (id: string, userId: string) => {
    try {
      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, id));
      if (chatRows.length === 0) {
        await ensureUserExists(userId);
        const timestamp = new Date();
        const savedModel = localStorage.getItem('current_model');
        const chatData = { id, title: "New Conversation", messages: "[]", model: savedModel || currentModel, visibility: "public" as const, createdAt: timestamp, updatedAt: timestamp, creatorUid: userId, reactions: JSON.stringify({ likes: {}, dislikes: {} }), participants: JSON.stringify([userId]), views: 0, uniqueViewers: JSON.stringify([]), isPinned: false };
        await db.insert(chatsTable).values(chatData);
        return true;
      }
      return false;
    } catch (error) {
      toast.error("Failed to initialize chat. Please try refreshing the page.");
      return false;
    }
  }, [currentModel, ensureUserExists]);

  const handleAIResponse = useCallback(async (messages: Message[], effectiveChatId: string) => {
    let fullResponse = "";
    const assistantId = uuidv4();
    let firstChunkProcessed = false;

    setChatState(prevState => ({ ...prevState, isLoading: true }));
    setShowThinking(true);

    const flushBufferToState = () => {
      if (textBufferRef.current) {
        const accumulatedText = textBufferRef.current;
        fullResponse += accumulatedText;
        textBufferRef.current = "";
        if (!firstChunkProcessed) {
          firstChunkProcessed = true;
          setShowThinking(false);
          const assistantMessagePlaceholder: Message = { id: assistantId, role: "assistant", content: accumulatedText, timestamp: new Date().toISOString() };
          setChatState(prevState => ({ ...prevState, messages: [...prevState.messages, assistantMessagePlaceholder] }));
        } else {
          setChatState(prevState => ({ ...prevState, messages: prevState.messages.map(msg => msg.id === assistantId ? { ...msg, content: fullResponse } : msg) }));
        }
      }
      updateScheduledRef.current = false;
      timerIdRef.current = null;
    };

    try {
      const stream = aiService.generateResponseStream(messages);
      for await (const chunk of stream) {
        textBufferRef.current += chunk;
        if (!updateScheduledRef.current) {
          updateScheduledRef.current = true;
          timerIdRef.current = setTimeout(flushBufferToState, 100);
        }
      }
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
      flushBufferToState();

      const finalAssistantMessage: Message = { id: assistantId, role: "assistant", content: fullResponse, timestamp: new Date().toISOString() };
      // const sanitizedMessage = sanitizeForDrizzle(finalAssistantMessage);
      // if (!validateMessage(sanitizedMessage)) throw new Error("Invalid assistant message structure");

      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, effectiveChatId));
      if (chatRows.length === 0) throw new Error("Chat not found");

      const chat: any = chatRows[0];
      const dbMessages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
      let messageExists = false;
      // const updatedDbMessages = dbMessages.map((msg: Message) => {
      //   if (msg.id === assistantId) {
      //       messageExists = true;
      //       return sanitizedMessage;
      //   }
      //   return msg;
      // });
      // if(!messageExists) {
      //   updatedDbMessages.push(sanitizedMessage);
      // }
      
      // await db.update(chatsTable).set({ messages: JSON.stringify(updatedDbMessages), updatedAt: new Date() }).where(eq(chatsTable.id, effectiveChatId));
    } catch (error) {
      setChatState(prevState => ({ ...prevState, error: "Failed to generate AI response" }));
      toast.error("Failed to generate AI response");
    } finally {
      setShowThinking(false);
      setChatState(prevState => ({ ...prevState, isLoading: false }));
      textBufferRef.current = "";
      updateScheduledRef.current = false;
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
    }
  }, [setChatState, setShowThinking]);

  const handleMediaResponse = useCallback(async (prompt: string, mediaType: 'image' | 'audio' | 'video', mediaConfig: any, effectiveChatId: string) => {
    const assistantId = uuidv4();
    const assistantMessagePlaceholder: Message = {
      id: assistantId,
      role: "assistant",
      content: `Generating ${mediaType}...`,
      timestamp: new Date().toISOString(),
      type: mediaType,
      mediaData: { aspectRatio: mediaConfig?.aspectRatio || '16:9' }
    };

    setChatState(prevState => ({ ...prevState, messages: [...prevState.messages, assistantMessagePlaceholder] }));
    setShowThinking(true);

    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: mediaType, prompt, ...mediaConfig })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      const finalAssistantMessage: Message = {
        ...assistantMessagePlaceholder,
        content: `Generated ${mediaType} for: "${prompt}"`,
        mediaUrl: data.url,
        mediaData: { ...assistantMessagePlaceholder.mediaData, thumbnailUrl: data.thumbnailUrl }
      };

      setChatState(prevState => ({
        ...prevState,
        messages: prevState.messages.map(msg => msg.id === assistantId ? finalAssistantMessage : msg)
      }));

      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, effectiveChatId));
      // if (chatRows.length > 0) {
      //   const chat: any = chatRows[0];
      //   const dbMessages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
      //   // const updatedDbMessages = [...dbMessages, sanitizeForDrizzle(finalAssistantMessage)];
      //   await db.update(chatsTable).set({ messages: JSON.stringify(updatedDbMessages), updatedAt: new Date() }).where(eq(chatsTable.id, effectiveChatId));
      // }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setChatState(prevState => ({
        ...prevState,
        error: `Failed to generate ${mediaType}: ${errorMessage}`,
        messages: prevState.messages.filter(msg => msg.id !== assistantId)
      }));
      toast.error(`Failed to generate ${mediaType}: ${errorMessage}`);
    } finally {
      setShowThinking(false);
      setChatState(prevState => ({ ...prevState, isLoading: false }));
    }
  }, [setChatState, setShowThinking]);

  const handleSubmit = useCallback(async () => {
    const { value } = useComposerStore.getState();
    const { chatId: currentChatId, chatState } = useChatInputStore.getState();
    const effectiveChatId = currentChatId || chatIdParam;
    
    if (!value.trim()) { toast.error("Cannot send empty message"); return; }
    if (!effectiveChatId) { toast.error("Chat ID is missing. Please refresh the page."); return; }
    if (chatState.isLoading) { toast.info("Already processing a message"); return; }

    setChatState(prevState => ({ ...prevState, isLoading: true, error: null }));
    
    const { currentMediaType, mediaConfig } = chatState;

    try {
      let currentUserId = user?.id || guestUserId;
      if (!currentUserId) {
        let id = localStorage.getItem("guestUserId") || `guest_${uuidv4()}`;
        if (!localStorage.getItem("guestUserId")) localStorage.setItem("guestUserId", id);
        setGuestUserId(id);
        currentUserId = id;
      }

      await createChatIfNotExists(effectiveChatId, currentUserId);
      
      // const userMessage: Message = { id: uuidv4(), role: "user", content: stripPrefixes(value.trim()), timestamp: new Date().toISOString(), type: currentMediaType };
      // const sanitizedUserMessage = sanitizeForDrizzle(userMessage);
      // if (!validateMessage(sanitizedUserMessage)) throw new Error("Invalid message structure");
      
      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, effectiveChatId));
      if (chatRows.length === 0) throw new Error("Chat not found. Please refresh the page and try again.");
      
      const chat: any = chatRows[0];
      const currentMessages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
      // const updatedMessages = [...currentMessages, sanitizedUserMessage];

      // await db.update(chatsTable).set({ messages: JSON.stringify(updatedMessages), updatedAt: new Date(), creatorUid: currentUserId }).where(eq(chatsTable.id, effectiveChatId));
      
      // setChatState(prevState => ({ ...prevState, messages: updatedMessages }));
      // setValue("");
      
      // if (currentMediaType === 'text') {
      //   await handleAIResponse(updatedMessages, effectiveChatId);
      // } else if (currentMediaType) {
      //   await handleMediaResponse(userMessage.content, currentMediaType, mediaConfig, effectiveChatId);
      // }

    } catch (error) {
      setChatState(prevState => ({ ...prevState, isLoading: false, error: "Failed to send message" }));
      setShowThinking(false);
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [user, guestUserId, chatIdParam, chatState, setChatState, setShowThinking, createChatIfNotExists, handleAIResponse, handleMediaResponse, setValue]);
  
  const handleURLAnalysis = useCallback(async (urls: string[], prompt: string, type: string = "url_analysis") => {
    const currentChatId = useChatInputStore.getState().chatId || chatIdParam;
    if (!currentChatId) { toast.error("Chat ID is missing."); return; }
  }, [chatIdParam, setChatState, setShowThinking, setValue, textareaRef]);

  const handleAIGenerate = useCallback(async (prompt: string, messages: Message[] = []) => {
  }, [setChatState, setShowThinking]);

  useEffect(() => {
    setChatId(chatIdParam);
    setOnSubmit(handleSubmit);
    setHandleInsertText(setValue);
    setHandleUrlAnalysis(handleURLAnalysis);
    setHandleAIGenerate(handleAIGenerate);
  }, [chatIdParam, setChatId, setOnSubmit, setValue, setHandleInsertText, handleSubmit, handleURLAnalysis, handleAIGenerate]);

  useEffect(() => {
    const handleGuestUser = () => {
      let storedGuestId = localStorage.getItem("guestUserId") || `guest_${uuidv4()}`;
      if (!localStorage.getItem("guestUserId")) localStorage.setItem("guestUserId", storedGuestId);
      setGuestUserId(storedGuestId);
    };
    const fetchUserData = async () => {
      setIsPageLoading(true);
      try {
        const response = await fetch("/api/auth/get-session");
        if (response.ok) {
          const data = await response.json();
          if (data?.user) {
            setUser(data.user);
          } else {
            setUser(null);
            handleGuestUser();
          }
        } else {
          setUser(null);
          handleGuestUser();
        }
      } catch (error) {
        setUser(null);
        handleGuestUser();
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!chatId || isSwitching) return;
    const fetchChat = async () => {
      try {
        const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, chatId));
        if (chatRows.length > 0) {
            
          const chat: any = chatRows[0];
          const messages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
          setChatState(prevState => ({ ...prevState, messages }));
          
          const isModelLocked = localStorage.getItem('force_model_override') === 'true';
          if (chat.model && currentModel !== chat.model && !isModelLocked) {
            setModel(chat.model);
          } else if (isModelLocked && chat.model !== currentModel) {
            await db.update(chatsTable).set({ model: currentModel, updatedAt: new Date() }).where(eq(chatsTable.id, chatId));
          }
        }
      } catch (error) {
        setChatState(prevState => ({ ...prevState, error: "Failed to load chat" }));
        toast.error("Failed to load chat");
      }
    };
    fetchChat();
  }, [chatId, currentModel, setModel, isSwitching, forceSetModel, setChatState]);

  useEffect(() => {

  }, [chatId, chatState.messages, chatState.isLoading, initialResponseGenerated, setModel, setChatState, handleAIResponse]);

  useEffect(() => {
    if (!params.slug && chatId && (user || guestUserId)) {
      const initializeTestChat = async () => {
        const userId = user?.id || guestUserId;
        if (!userId) return;
        await createChatIfNotExists(chatId, userId);
      };
      initializeTestChat();
    }
  }, [chatId, params.slug, user, guestUserId, createChatIfNotExists]);

  useEffect(() => () => {
    if (timerIdRef.current) clearTimeout(timerIdRef.current);
  }, []);
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useParams } from "next/navigation";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import { chats as chatsTable } from "@/db/schema";
import { sanitizeForDrizzle, stripPrefixes } from "@/lib/utils";
import { aiService } from "@/services/ai-service";
import { useAIModelStore } from "@/store/ai-model-store";
import { useChatInputStore } from "@/store/chat-store";
import { useComposerStore } from "@/store/composer-store";
import type { Message } from "@/types/chat";

type Params = { slug: string };

interface ChatContextType {
  user: any;
  guestUserId: string | null;
  isPageLoading: boolean;
  handleSubmit: () => Promise<void>;
  handleURLAnalysis: (
    urls: string[],
    prompt: string,
    type?: string,
  ) => Promise<void>;
  handleAIGenerate: (prompt: string, messages?: Message[]) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const params = useParams<Params>() ?? { slug: "" };
  const [testChatId] = useState<string>(() => uuidv4());
  const chatIdParam = params.slug || testChatId;

  const [user, setUser] = useState<any>(null);
  const [guestUserId, setGuestUserId] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const textBufferRef = useRef("");
  const updateScheduledRef = useRef(false);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const { currentModel, setModel, isSwitching, forceSetModel } = useAIModelStore();
  const { setChatState, chatId, setChatId, setShowThinking } = useChatInputStore();
  const { setValue, setOnSubmit, setHandleInsertText, setHandleUrlAnalysis, setHandleAIGenerate } = useComposerStore();

  const ensureUserExists = useCallback(async (userId: string) => {
    try {
      const { user: userTable } = await import("@/db/schema");
      const userExists = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.id, userId)).then((rows) => rows.length > 0);
      if (!userExists) {
        await db.insert(userTable).values({
          id: userId,
          name: "Guest User",
          email: `${userId}@example.com`,
          isAnonymous: true,
        });
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
        const savedModel = localStorage.getItem("current_model");
        const chatData = {
          id,
          title: "New Conversation",
          messages: "[]",
          model: savedModel || currentModel,
          visibility: "public" as const,
          createdAt: timestamp,
          updatedAt: timestamp,
          creatorUid: userId,
          reactions: JSON.stringify({ likes: {}, dislikes: {} }),
          participants: JSON.stringify([userId]),
          views: 0,
          uniqueViewers: JSON.stringify([]),
          isPinned: false,
        };
        await db.insert(chatsTable).values(chatData);
        return true;
      }
      return false;
    } catch (error) {
      toast.error("Failed to initialize chat. Please try refreshing the page.");
      return false;
    }
  }, [currentModel, ensureUserExists]);

  const handleAIResponseStream = useCallback(async (messages: Message[], effectiveChatId: string) => {
    let fullResponse = "";
    const assistantId = uuidv4();
    let firstChunkProcessed = false;

    setChatState((prevState) => ({ ...prevState, isLoading: true }));
    setShowThinking(true);

    const flushBufferToState = () => {
      if (textBufferRef.current) {
        const accumulatedText = textBufferRef.current;
        fullResponse += accumulatedText;
        textBufferRef.current = "";

        if (!firstChunkProcessed) {
          firstChunkProcessed = true;
          setShowThinking(false);
          const assistantMessagePlaceholder: Message = {
            id: assistantId,
            role: "assistant",
            content: accumulatedText,
            timestamp: new Date().toISOString(),
          };
          setChatState((prevState) => ({
            ...prevState,
            messages: [...prevState.messages, assistantMessagePlaceholder],
          }));
        } else {
          setChatState((prevState) => ({
            ...prevState,
            messages: prevState.messages.map((msg) =>
              msg.id === assistantId ? { ...msg, content: fullResponse } : msg,
            ),
          }));
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

      const finalAssistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: fullResponse,
        timestamp: new Date().toISOString(),
      };

      const sanitizedMessage = sanitizeForDrizzle(finalAssistantMessage);
      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, effectiveChatId));
      if (chatRows.length === 0) throw new Error("Chat not found");

      const chat: any = chatRows[0];
      const dbMessages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
      const updatedDbMessages = dbMessages.map((msg: Message) =>
        msg.id === assistantId ? sanitizedMessage : msg,
      );

      if (!updatedDbMessages.some((msg: { id: string }) => msg.id === assistantId)) {
        updatedDbMessages.push(sanitizedMessage);
      }

      await db.update(chatsTable).set({ messages: JSON.stringify(updatedDbMessages), updatedAt: new Date() }).where(eq(chatsTable.id, effectiveChatId));
    } catch (error) {
      setChatState((prevState) => ({ ...prevState, error: "Failed to generate AI response" }));
      toast.error("Failed to generate AI response");
    } finally {
      setShowThinking(false);
      setChatState((prevState) => ({ ...prevState, isLoading: false }));
      textBufferRef.current = "";
      updateScheduledRef.current = false;
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
    }
  }, [setChatState, setShowThinking]);

  const handleGenerativeRequest = useCallback(async (prompt: string, mediaType: "image" | "video" | "audio", mediaConfig: any, effectiveChatId: string) => {
    const assistantId = uuidv4();
    const assistantMessagePlaceholder: Message = {
      id: assistantId,
      role: "assistant",
      content: `Generating ${mediaType}...`,
      timestamp: new Date().toISOString(),
      type: mediaType,
      mediaData: {
        aspectRatio: mediaConfig?.aspectRatio || (mediaType === "image" ? "1:1" : "16:9"),
      },
    };

    setChatState((prevState) => ({ ...prevState, messages: [...prevState.messages, assistantMessagePlaceholder] }));
    setShowThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaCategory: mediaType,
          message: prompt,
          aspectRatio: mediaConfig?.aspectRatio || "1:1",
          ...mediaConfig,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate ${mediaType}`);
      }

      const data = await response.json();
      const mediaUrl = data.imageUrl || data.url || data.uri || "";

      if (!mediaUrl) {
        console.error("No media URL found in response:", data);
        throw new Error(`No ${mediaType} URL in the response`);
      }

      const finalAssistantMessage: Message = {
        ...assistantMessagePlaceholder,
        content: `Generated ${mediaType} for: "${prompt}"`,
        mediaUrl: mediaUrl,
        mediaData: {
          ...assistantMessagePlaceholder.mediaData,
          thumbnailUrl: data.thumbnailUrl || mediaUrl,
        },
      };

      setChatState((prevState) => ({
        ...prevState,
        messages: prevState.messages.map((msg) => msg.id === assistantId ? finalAssistantMessage : msg),
      }));

      if (mediaType === "image") {
        useComposerStore.getState().setImagePreview(mediaUrl);
      }

      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, effectiveChatId));
      if (chatRows.length > 0) {
        const chat: any = chatRows[0];
        const dbMessages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
        const updatedDbMessages = [...dbMessages, sanitizeForDrizzle(finalAssistantMessage)];
        await db.update(chatsTable).set({ messages: JSON.stringify(updatedDbMessages), updatedAt: new Date() }).where(eq(chatsTable.id, effectiveChatId));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setChatState((prevState) => ({
        ...prevState,
        error: `Failed to generate ${mediaType}: ${errorMessage}`,
        messages: prevState.messages.filter((msg) => msg.id !== assistantId),
      }));
      toast.error(`Failed to generate ${mediaType}: ${errorMessage}`);
    } finally {
      setShowThinking(false);
      setChatState((prevState) => ({ ...prevState, isLoading: false }));
    }
  }, [setChatState, setShowThinking]);

  const handleSubmit = useCallback(async () => {
    const { value } = useComposerStore.getState();
    const { chatId: currentChatId, chatState } = useChatInputStore.getState();
    const effectiveChatId = currentChatId || chatIdParam;

    if (!value.trim()) {
      toast.error("Cannot send an empty message.");
      return;
    }
    if (!effectiveChatId) {
      toast.error("Missing Chat ID. Please refresh the page.");
      return;
    }
    if (chatState.isLoading) {
      toast.info("A message is already being processed.");
      return;
    }

    setChatState((prevState) => ({ ...prevState, isLoading: true, error: null }));
    const { currentMediaType = "text", mediaConfig } = chatState;

    try {
      let currentUserId = user?.id || guestUserId;
      if (!currentUserId) {
        let id = localStorage.getItem("guestUserId") || `guest_${uuidv4()}`;
        if (!localStorage.getItem("guestUserId")) {
          localStorage.setItem("guestUserId", id);
        }
        setGuestUserId(id);
        currentUserId = id;
      }

      await createChatIfNotExists(effectiveChatId, currentUserId);

      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: stripPrefixes(value.trim()),
        timestamp: new Date().toISOString(),
        type: currentMediaType || "text",
      };

      const sanitizedUserMessage = sanitizeForDrizzle(userMessage);
      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, effectiveChatId));
      if (chatRows.length === 0) {
        throw new Error("Chat not found. Please refresh and try again.");
      }

      const chat: any = chatRows[0];
      const currentMessages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
      const updatedMessages = [...currentMessages, sanitizedUserMessage];

      await db.update(chatsTable).set({ messages: JSON.stringify(updatedMessages), updatedAt: new Date(), creatorUid: currentUserId }).where(eq(chatsTable.id, effectiveChatId));
      
      setChatState((prevState) => ({ ...prevState, messages: updatedMessages }));
      setValue("");

      if (!currentMediaType || currentMediaType === "text") {
        await handleAIResponseStream(updatedMessages, effectiveChatId);
      } else if (["image", "video", "audio"].includes(currentMediaType)) {
        await handleGenerativeRequest(
          userMessage.content,
          currentMediaType as "image" | "video" | "audio",
          mediaConfig,
          effectiveChatId
        );
      } else {
        console.warn("Unknown media type, defaulting to text generation");
        await handleAIResponseStream(updatedMessages, effectiveChatId);
      }
    } catch (error) {
      setChatState((prevState) => ({ ...prevState, isLoading: false, error: "Failed to send the message." }));
      setShowThinking(false);
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : "An unknown error occurred."}`);
    }
  }, [user, guestUserId, chatIdParam, setChatState, setChatState, setShowThinking, createChatIfNotExists, handleAIResponseStream, handleGenerativeRequest, setValue]);

  const handleURLAnalysis = useCallback(async (urls: string[], prompt: string, type: string = "url_analysis") => {
    const currentChatId = useChatInputStore.getState().chatId || chatIdParam;
    if (!currentChatId) {
      toast.error("A Chat ID is required for URL analysis.");
    }
  }, [chatIdParam]);

  const handleAIGenerate = useCallback(
    async (prompt: string, messages: Message[] = []) => {},
    [],
  );

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
      if (!localStorage.getItem("guestUserId")) {
        localStorage.setItem("guestUserId", storedGuestId);
      }
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
          setChatState((prevState) => ({ ...prevState, messages }));

          const isModelLocked = localStorage.getItem("force_model_override") === "true";
          if (chat.model && currentModel !== chat.model && !isModelLocked) {
            setModel(chat.model);
          } else if (isModelLocked && chat.model !== currentModel) {
            await db.update(chatsTable).set({ model: currentModel, updatedAt: new Date() }).where(eq(chatsTable.id, chatId));
          }
        }
      } catch (error) {
        setChatState((prevState) => ({ ...prevState, error: "Failed to load chat." }));
        toast.error("Failed to load the chat.");
      }
    };
    fetchChat();
  }, [chatId, currentModel, setModel, isSwitching, forceSetModel, setChatState]);

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

  useEffect(
    () => () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
    },
    [],
  );

  const contextValue = {
    user,
    guestUserId,
    isPageLoading,
    handleSubmit,
    handleURLAnalysis,
    handleAIGenerate,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
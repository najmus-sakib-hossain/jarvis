// Zustand store for chat input states and comprehensive chat management
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, MessageRole } from '@/types/chat';

// Add media configuration types
interface MediaConfig {
  type: 'text' | 'image' | 'audio' | 'video';
  model?: string;
  aspectRatio?: string;
  duration?: string;
  endpoint?: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentMediaType?: 'text' | 'image' | 'audio' | 'video';
  mediaConfig?: MediaConfig;
}

// Update the MessageUpdate type to be more specific
type MessageUpdate = {
  content?: string | ((content: string) => string);
  id?: string;
  role?: MessageRole;
  timestamp?: string;
  type?: 'text' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  mediaData?: {
    aspectRatio?: string;
    duration?: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
  };
};

interface ChatInputStore {
  // Input value management
  value: string;
  setValue: (v: string) => void;

  // UI state management
  isMaxHeight: boolean;
  setIsMaxHeight: (v: boolean) => void;
  isLoggingIn: boolean;
  setIsLoggingIn: (v: boolean) => void;
  inputHeight: number;
  setInputHeight: (v: number) => void;

  // Feature toggles
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  toggleSearch: () => void;
  showResearch: boolean;
  setShowResearch: (v: boolean) => void;
  toggleResearch: () => void;
  showThinking: boolean;
  setShowThinking: (v: boolean) => void;
  toggleThinking: () => void;

  // Media management
  imagePreview: string | null;
  setImagePreview: (v: string | null) => void;

  // Chat ID management
  chatId: string | null;
  setChatId: (id: string) => void;

  // Chat state management
  chatState: ChatState;
  setChatState: (updater: ChatState | ((prevState: ChatState) => ChatState)) => void;

  // Granular chat actions (still useful for specific cases)
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: MessageUpdate) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;

  // Streaming state
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  streamingMessageId: string | null;
  setStreamingMessageId: (id: string | null) => void;
  
  // *** NEW: Centralized action for sending messages ***
  handleSendMessage: (userMessage: Message) => Promise<void>;
}

const DEFAULT_CHAT_STATE: ChatState = {
  messages: [], // Always initialize with an empty array
  isLoading: false,
  error: null,
  currentMediaType: 'text', // Explicitly set default
  mediaConfig: {
    type: 'text',
    model: 'gemma-3-27b-it',
  },
};

export const useChatInputStore = create<ChatInputStore>()(
  persist(
    (set, get) => ({
      // ... (all your existing state properties like value, isMaxHeight, etc.)
      value: '',
      setValue: (v) => set({ value: v }),
      isMaxHeight: false,
      setIsMaxHeight: (v) => set({ isMaxHeight: v }),
      isLoggingIn: false,
      setIsLoggingIn: (v) => set({ isLoggingIn: v }),
      inputHeight: 48,
      setInputHeight: (v) => set({ inputHeight: v }),
      showSearch: false,
      setShowSearch: (v) => set({ showSearch: v }),
      toggleSearch: () => set((state) => ({ showSearch: !state.showSearch })),
      showResearch: false,
      setShowResearch: (v) => set({ showResearch: v }),
      toggleResearch: () => set((state) => ({ showResearch: !state.showResearch })),
      showThinking: false,
      setShowThinking: (v) => set({ showThinking: v }),
      toggleThinking: () => set((state) => ({ showThinking: !state.showThinking })),
      imagePreview: null,
      setImagePreview: (v) => set({ imagePreview: v }),
      chatId: null,
      setChatId: (id) => set({ chatId: id }),
      chatState: DEFAULT_CHAT_STATE,
      setChatState: (updater) =>
        set((state) => ({
          chatState:
            typeof updater === 'function'
              ? (updater as (prevState: ChatState) => ChatState)(state.chatState || DEFAULT_CHAT_STATE)
              : updater,
        })),
        
      // Granular actions implementation
      addMessage: (message) =>
        set((state) => ({
          chatState: {
            ...(state.chatState || DEFAULT_CHAT_STATE),
            messages: [...(state.chatState?.messages || []), message],
          },
        })),

      updateMessage: (messageId, updates) =>
        set((state) => ({
          chatState: {
            ...state.chatState,
            messages: state.chatState.messages.map((msg) => {
              if (msg.id === messageId) {
                const updatedMsg = { ...msg };
                // Handle content update (string or function)
                if (updates.content !== undefined) {
                  updatedMsg.content =
                    typeof updates.content === 'function'
                      ? updates.content(msg.content)
                      : updates.content;
                }
                // Update other properties
                if (updates.id !== undefined) updatedMsg.id = updates.id;
                if (updates.role !== undefined) updatedMsg.role = updates.role;
                if (updates.timestamp !== undefined) updatedMsg.timestamp = updates.timestamp;
                if (updates.type !== undefined) updatedMsg.type = updates.type;
                if (updates.mediaUrl !== undefined) updatedMsg.mediaUrl = updates.mediaUrl;
                if (updates.mediaData !== undefined) updatedMsg.mediaData = updates.mediaData;
                return updatedMsg;
              }
              return msg;
            }),
          },
        })),

      setLoading: (loading) =>
        set((state) => ({
          chatState: { ...state.chatState, isLoading: loading },
        })),

      setError: (error) =>
        set((state) => ({
          chatState: { ...state.chatState, error },
        })),

      clearMessages: () =>
        set((state) => ({
          chatState: { ...state.chatState, messages: [] },
        })),
        
      // Streaming state
      isStreaming: false,
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
      streamingMessageId: null,
      setStreamingMessageId: (id) => set({ streamingMessageId: id }),

      // *** NEW CENTRALIZED ACTION IMPLEMENTATION ***
      handleSendMessage: async (userMessage: Message) => {
        // --- STEP 1: OPTIMISTIC UI UPDATE ---
        // Add the user's message to the state immediately.
        // This makes the media preview or text appear instantly.
        get().addMessage(userMessage);

        // --- STEP 2: SET LOADING AND THINKING STATE ---
        // Use the granular setters. setShowThinking is for the text-only indicator.
        get().setLoading(true);
        if (userMessage.type !== 'image' && userMessage.type !== 'audio' && userMessage.type !== 'video') {
            get().setShowThinking(true);
        }

        try {
          // --- STEP 3: PREPARE AND MAKE THE API CALL ---
          // This is where you would call your backend API.
          // The logic below is a placeholder for a typical streaming chat response.
          console.log("Making API call with messages:", get().chatState.messages);

          // Example: Mocking an API call
          await new Promise(resolve => setTimeout(resolve, 1500)); // Represents network delay

          // When the API responds (even just to start a stream), add the assistant's message
          const assistantMessageId = 'ai-' + Date.now();
          const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '', // Start with empty content for streaming
            timestamp: new Date().toISOString()
          };
          get().addMessage(assistantMessage);
          get().setStreamingMessageId(assistantMessageId);
          get().setIsStreaming(true);

          // --- STEP 4: SIMULATE STREAMING RESPONSE ---
          // In a real app, you would get chunks from your API and call updateMessage.
          const finalContent = "This is the complete response from the AI, streamed token by token.";
          for (let i = 0; i < finalContent.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 20)); // Simulate token delay
            get().updateMessage(assistantMessageId, {
                content: (currentContent) => currentContent + finalContent[i],
            });
          }

        } catch (error) {
          console.error("Failed to get a response:", error);
          const errorMessage: Message = {
            id: 'error-' + Date.now(),
            role: 'assistant',
            content: "I'm sorry, but I encountered an error. Please try again.",
            timestamp: new Date().toISOString()
          };
          get().addMessage(errorMessage);
          get().setError("Failed to fetch response.");
        } finally {
          // --- STEP 5: RESET ALL LOADING STATES ---
          // This block runs after the try/catch, ensuring states are always cleaned up.
          get().setLoading(false);
          get().setShowThinking(false);
          get().setIsStreaming(false);
          get().setStreamingMessageId(null);
        }
      },
    }),
    {
      name: 'friday-chat-storage',
      partialize: (state) => ({
        showSearch: state.showSearch,
        showResearch: state.showResearch,
        showThinking: state.showThinking,
        inputHeight: state.inputHeight,
        chatId: state.chatId,
        chatState: {
          currentMediaType: state.chatState.currentMediaType,
          mediaConfig: state.chatState.mediaConfig,
        },
      }),
    }
  )
);
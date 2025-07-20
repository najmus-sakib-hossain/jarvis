import { create } from 'zustand';

export interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface FridayChatState {
  messages: Message[];
  isLoading: boolean;
  mediaCategory: 'text' | 'image' | 'video' | 'audio';
  parentSubCategory: string;
  childSubCategory: string | null;
  setCategories: (categories: { 
    media: 'text' | 'image' | 'video' | 'audio', 
    parent: string, 
    child: string | null 
  }) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (textChunk: string) => void;
  setLoading: (loading: boolean) => void;
  clearChat: () => void;
}

export const useFridayChatStore = create<FridayChatState>((set) => ({
  messages: [],
  isLoading: false,
  mediaCategory: 'text',
  parentSubCategory: 'text-default',
  childSubCategory: 'fast',
  
  setCategories: ({ media, parent, child }) => set({ 
    mediaCategory: media,
    parentSubCategory: parent,
    childSubCategory: child,
  }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  updateLastMessage: (textChunk) => {
    set((state) => {
      if (state.messages.length === 0 || state.messages[state.messages.length - 1].role !== 'model') {
        return state;
      }
      
      const updatedMessages = [...state.messages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      
      updatedMessages[updatedMessages.length - 1] = {
        ...lastMessage,
        parts: [{ text: lastMessage.parts[0].text + textChunk }],
      };
      
      return { messages: updatedMessages };
    });
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearChat: () => set({ messages: [], isLoading: false }),
}));

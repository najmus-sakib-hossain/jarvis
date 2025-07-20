export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'image' | 'audio' | 'video';

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: string;
  type?: MessageType;
  mediaUrl?: string;
  mediaData?: {
    aspectRatio?: string;
    duration?: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
  };
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentMediaType: MessageType; // Changed from optional to required
  mediaConfig?: {
    type: MessageType;
    model?: string;
    aspectRatio?: string;
    duration?: string;
    endpoint?: string;
  };
}
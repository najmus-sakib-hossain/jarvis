"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChatInputStore } from '@/store/chat-store';
import { useAIModelStore } from '@/store/ai-model-store';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { ChatOptions } from '../components/chat/composer/chat-options';
import { Message, MessageRole, MessageType } from '@/types/chat';

export function ChatInput() {
  // Get state from Zustand stores
  const { 
    value, setValue, 
    inputHeight, setInputHeight,
    chatState, addMessage, setLoading,
    isStreaming, setIsStreaming
  } = useChatInputStore();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus on textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    
    // Adjust textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(200, Math.max(48, textareaRef.current.scrollHeight));
      setInputHeight(newHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle sending message
  const handleSendMessage = async () => {
    if (!value.trim() || isStreaming) return;
    
    const mediaType = chatState.currentMediaType || 'text';
    const mediaConfig = chatState.mediaConfig;
    
    // Create and add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: value,
      role: 'user' as MessageRole,
      timestamp: Date.now().toString(),
      type: mediaType as MessageType
    };
    
    // Add user message to chat
    addMessage(userMessage);
    
    // Clear input
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      setInputHeight(48);
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      if (mediaType === 'text') {
        // Handle text generation
        await handleTextGeneration(value);
      } else {
        // Handle media generation
        await handleMediaGeneration(value, mediaType as 'image' | 'audio' | 'video', mediaConfig);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to generate response. Please try again.');
      setLoading(false);
    }
  };
  
  const handleTextGeneration = async (prompt: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: 'gemma-3-27b-it',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Chat API error: ${await response.text()}`);
      }
      
      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: uuidv4(),
        content: '',
        role: 'assistant',
        timestamp: Date.now().toString(),
        type: 'text'
      };
      
      // Add initial empty message
      addMessage(assistantMessage);
      
      // Start streaming
      setIsStreaming(true);
      
      // Process streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body reader');
      
      const decoder = new TextDecoder();
      let fullContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonString = line.substring(6);
              const data = JSON.parse(jsonString);
              if (data.text) {
                fullContent += data.text;
                // Update message content - needs to be done through API
                updateAssistantMessage(assistantMessage.id, fullContent);
              }
            } catch (e) {
              // Ignore parsing errors from incomplete chunks
            }
          }
        }
      }
    } finally {
      setIsStreaming(false);
      setLoading(false);
    }
  };
  
  const handleMediaGeneration = async (
    prompt: string, 
    mediaType: 'image' | 'audio' | 'video',
    mediaConfig?: any
  ) => {
    try {
      console.log(`Generating ${mediaType} with prompt: "${prompt}"`);
      
      // Call the media API
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: mediaType,
          prompt,
          aspectRatio: mediaConfig?.aspectRatio || '16:9',
          model: mediaConfig?.model,
          duration: mediaConfig?.duration || '8'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Media API error: ${await response.text()}`);
      }
      
      // Parse the response
      const data = await response.json();
      console.log(`Media generation response:`, data);
      
      // Create and add assistant message with media
      const assistantMessage: Message = {
        id: uuidv4(),
        content: `Generated ${mediaType} based on your prompt`,
        role: 'assistant',
        timestamp: Date.now().toString(),
        type: mediaType,
        mediaUrl: data.url,
        mediaData: {
          thumbnailUrl: data.thumbnailUrl,
          aspectRatio: mediaConfig?.aspectRatio || '16:9'
        }
      };
      
      addMessage(assistantMessage);
      
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to update assistant message content
  const updateAssistantMessage = (id: string, content: string) => {
    useChatInputStore.getState().updateMessage(id, { content });
  };
  
  return (
    <div className="chat-input-container relative rounded-lg border bg-background p-2">
      <div className="flex items-end gap-2">
        <div className="relative flex-grow">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[48px] w-full resize-none rounded-md border-0 bg-background p-3 shadow-none focus-visible:ring-0"
            style={{ height: `${inputHeight}px` }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <ChatOptions />
          
          <Button 
            onClick={handleSendMessage}
            disabled={!value.trim() || isStreaming}
            size="icon"
            className="h-9 w-9 rounded-md"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* {chatState.currentMediaType !== 'text' && (
        <div className="mt-2 px-2 text-xs text-muted-foreground">
          Generating {chatState.currentMediaType} content with {
            chatState.mediaConfig?.model || (
              chatState.currentMediaType === 'image' ? 'Imagen' : 
              chatState.currentMediaType === 'video' ? 'Veo' : 'Audio generator'
            )
          }
        </div>
      )} */}
    </div>
  );
}

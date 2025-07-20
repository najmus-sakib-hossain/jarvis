import React from 'react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserIcon } from 'lucide-react';

interface VideoPreviewProps {
  message: Message;
  isFadingOut?: boolean;
  onTransitionEnd?: () => void;
}

export function VideoPreview({ message, isFadingOut, onTransitionEnd }: VideoPreviewProps) {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 p-4 transition-opacity",
        isUser ? "justify-end" : "justify-start",
        isFadingOut && "opacity-0"
      )}
      onTransitionEnd={onTransitionEnd}
    >
      {!isUser && (
        <Avatar className="size-9 shrink-0 bg-muted">
          <AvatarImage src="/ai-avatar.png" alt="AI" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex max-w-[80%] flex-col gap-2",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-xl px-4 py-3",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          <p className="text-sm">{message.content}</p>
        </div>
        
        <div className="w-full overflow-hidden rounded-xl">
          <video 
            src={message.mediaUrl} 
            controls
            className="w-full h-auto"
            poster={message.mediaData?.thumbnailUrl}
          />
        </div>
      </div>
      
      {isUser && (
        <Avatar className="size-9 shrink-0">
          <AvatarFallback>
            <UserIcon className="size-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

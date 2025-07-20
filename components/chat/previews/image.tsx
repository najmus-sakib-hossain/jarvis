import React, { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { HelloGlow } from '@/components/common/hello-glow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import UserMessage from '@/components/chat/messages/message-actions-user';
import { MarkdownPreview } from '@/components/chat/previews/text';
import { authClient } from '@/lib/auth/auth-client';

interface ImagePreviewProps {
  message: Message;
  isFadingOut?: boolean;
  onTransitionEnd?: () => void;
}

export function ImagePreview({ message, isFadingOut, onTransitionEnd }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(!message.mediaUrl || message.content === "Generating image...");
  const [imageError, setImageError] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Fetch user session (same as in message-item)
  useEffect(() => {
    const fetchSession = async () => {
      const { data: session } = await authClient.getSession();
      setUser(session?.user ?? null);
    };
    fetchSession();
  }, []);

  const fallbackInitial = user?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U";

  const aspectRatioValue = React.useMemo(() => {
    if (message.mediaData?.aspectRatio) {
      const [width, height] = message.mediaData.aspectRatio.split(':').map(Number);
      if (width && height) {
        return width / height;
      }
    }
    return 16 / 9;
  }, [message.mediaData?.aspectRatio]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
    console.error('Failed to load image:', message.mediaUrl);
  };

  const handleWordIndexUpdate = useCallback((index: number) => {
    setCurrentWordIndex(index);
  }, []);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  const isUserMessage = message.role === 'user';

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 transition-opacity",
        isUserMessage ? "justify-end" : "justify-start",
        isFadingOut && "opacity-0"
      )}
      onTransitionEnd={onTransitionEnd}
    >
      {isUserMessage ? (
        <div className="flex w-full flex-row items-start justify-end gap-2">
          <div className="hover:bg-primary-foreground hover:text-primary relative flex items-center justify-center rounded-xl rounded-tr-none border py-1 px-3 font-mono text-sm">
            <MarkdownPreview
              content={message.content}
              currentWordIndex={currentWordIndex}
            />
          </div>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger>
              <Avatar className="size-9">
                <AvatarImage
                  src={user?.image ?? undefined}
                  alt={user?.name || user?.email || "User"}
                />
                <AvatarFallback>{fallbackInitial}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="size-min w-min border-none p-0 shadow-none"
            >
              <UserMessage
                content={message.content}
                onWordIndexUpdate={handleWordIndexUpdate}
                onPlayStateChange={handlePlayStateChange}
              />
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <>
          <div className={cn("w-full rounded-md", !isLoading && "overflow-hidden ")}>
            <HelloGlow>
              <AspectRatio ratio={aspectRatioValue} className="w-full">
                {!imageError && message.mediaUrl && (
                  <img
                    src={message.mediaUrl}
                    alt={message.content || "Generated image"}
                    className={cn(
                      "w-full h-full object-cover transition-opacity duration-300 rounded-md",
                      isLoading ? "opacity-0" : "opacity-100"
                    )}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                  />
                )}
                {/* {!isLoading && imageError && (
                  <p className="text-sm text-muted-foreground">Failed to load image</p>
                )}
                {isLoading && (
                  <p className="text-sm text-muted-foreground animate-pulse">Generating image...</p>
                )} */}
              </AspectRatio>
            </HelloGlow>
          </div>
        </>
      )}
    </div>
  );
}


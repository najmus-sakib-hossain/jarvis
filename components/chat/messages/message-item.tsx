import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth/auth-client";
import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from "react";
import AiMessage from "@/components/chat/messages/message-actions-ai";
import UserMessage from "@/components/chat/messages/message-actions-user";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MarkdownPreview } from "@/components/chat/previews/text";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { useChatInputStore } from "@/store/chat-store";
import { HelloGlow } from "@/components/common/hello-glow";

interface ChatMessageProps {
  message: Message;
  chatId: string | null;
  index: number;
  className?: string;
  isFadingOut?: boolean;
  onTransitionEnd?: () => void;
  selectedAI?: string;
}

interface User {
  image?: string | null;
  name?: string;
  email?: string;
}

export const ChatMessage = memo(
  ({
    message,
    chatId,
    index,
    className,
    isFadingOut,
    onTransitionEnd,
    selectedAI = "",
  }: ChatMessageProps) => {
    const [user, setUser] = useState<User | null>(null);
    const { chatState } = useChatInputStore();

    useEffect(() => {
      const fetchSession = async () => {
        const { data: session } = await authClient.getSession();
        setUser(session?.user ?? null);
      };
      fetchSession();
    }, []);

    const isAssistant = message.role === "assistant";
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);

    const fallbackInitial = useMemo(
      () => user?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U",
      [user]
    );


    const handleWordIndexUpdate = useCallback((index: number) => {
      setCurrentWordIndex(index);
    }, []);

    const handlePlayStateChange = useCallback(
      (playing: boolean, audioElement: HTMLAudioElement | null = null) => {
        setIsPlaying(playing);
        if (audioElement) {
          audioRef.current = audioElement;

          if (playing) {
            setIsPopoverOpen(false);
            audioElement.ontimeupdate = () => {
              if (audioElement.duration) {
                setProgress(audioElement.currentTime / audioElement.duration);
              }
            };
            audioElement.onended = () => {
              setIsPlaying(false);
              setProgress(0);
            };
          }
        }
      },
      []
    );

    useEffect(() => {
      const audio = audioRef.current;
      return () => {
        if (audio) {
          audio.pause();
          audio.ontimeupdate = null;
          audio.onended = null;
        }
      };
    }, []);

    const renderMessageContent = () => {
      if (message.content === "thinking" && chatState.currentMediaType === 'text') {
        return (
          <AnimatedGradientText text="Friday is thinking..." />
        );
      }

      if (message.content === "thinking" && chatState.currentMediaType !== 'text') {
        return (
          <HelloGlow className="size-[500px] min-w-full overflow-hidden rounded-md border" />
        );
      }

      return (
        <MarkdownPreview
          content={message.content}
          currentWordIndex={currentWordIndex}
        />
      );
    };

    return (
      <div
        className={cn(
          "flex w-full",
          isAssistant ? "justify-start" : "justify-end",
          className
        )}
      >
        {!isAssistant ? (
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
          <div className="flex w-full flex-col items-start">
            <div
              className={cn(
                "hover:text-primary relative flex w-full items-center font-mono text-sm pl-1.5",
                // isFadingOut && "fade-out",
                // chatState.currentMediaType === 'text' && isFadingOut && "fade-out",
                // isFadingOut && "opacity-0",
                // chatState.currentMediaType !== 'text' && isFadingOut && "opacity-0"
              )}
              onTransitionEnd={onTransitionEnd}
            >
              {renderMessageContent()}
            </div>
            <AiMessage
              content={message.content}
              onWordIndexUpdate={handleWordIndexUpdate}
              onPlayStateChange={handlePlayStateChange}
            />
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.message === nextProps.message &&
    prevProps.chatId === nextProps.chatId &&
    prevProps.index === nextProps.index &&
    prevProps.isFadingOut === nextProps.isFadingOut &&
    prevProps.selectedAI === nextProps.selectedAI
);

ChatMessage.displayName = "ChatMessage";
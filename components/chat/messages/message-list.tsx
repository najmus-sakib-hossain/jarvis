import React, { useLayoutEffect, useRef, useState, useCallback, useEffect } from "react"
import { Message, MessageRole } from "@/types/chat"
import { ChatMessage } from "@/components/chat/messages/message-item"
import { cn } from "@/lib/utils"
import { useChatInputStore } from "@/store/chat-store"
import { useAIModelStore } from "@/store/ai-model-store"
import { ImagePreview } from "@/components/chat/previews/image"
import { AudioPreview } from "@/components/chat/previews/audio"
import { VideoPreview } from "@/components/chat/previews/video"

interface MessageListProps {
  className?: string
}

export function MessageList({
  className
}: MessageListProps) {
  const { currentModel } = useAIModelStore()
  const { chatState, showThinking, setShowThinking, chatId } = useChatInputStore()
  const messages = chatState?.messages || [];
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([])
  const [localShowThinking, setLocalShowThinking] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const previousScrollHeight = useRef<number>(0)

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight + 2000
      setShowScrollButton(false)
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const nearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!nearBottom)
    }
  }, [])

  useEffect(() => {
    // console.log("Messages or thinking state changed:",
    //   "messages:", messages?.length,
    //   "showThinking:", showThinking,
    //   "isLoading:", chatState?.isLoading);

    const shouldShowThinking = chatState?.isLoading || showThinking

    if (shouldShowThinking) {
      setLocalShowThinking(true)
      setIsFadingOut(false)

      const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null
      const needsThinkingIndicator = lastMessage && lastMessage.role === "user"

      if (needsThinkingIndicator) {
        const thinkingPlaceholder: Message = {
          id: "thinking-placeholder",
          content: "thinking",
          role: "assistant" as MessageRole,
          timestamp: Date.now().toString(),
        };

        const updatedMessages = [...messages, thinkingPlaceholder];
        console.log("Setting visible messages with thinking indicator:", updatedMessages.length);
        setVisibleMessages(updatedMessages);
      } else {
        console.log("Setting visible messages without thinking indicator:", messages.length);
        setVisibleMessages(messages || [])
      }
    } else if (localShowThinking) {
      setIsFadingOut(true)
    } else {
      console.log("Normal state, setting visible messages:", messages?.length);
      setVisibleMessages(messages || [])
    }
  }, [chatState?.isLoading, showThinking, messages, localShowThinking])

  const handleTransitionEnd = useCallback(() => {
    if (isFadingOut) {
      setLocalShowThinking(false)
      setIsFadingOut(false)
      setVisibleMessages([...messages])
      setShowThinking(false)
    }
  }, [isFadingOut, messages, setShowThinking])

  useLayoutEffect(() => {
    scrollToBottom()
  }, [visibleMessages, localShowThinking, scrollToBottom])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      if (container) {
        const currentScrollHeight = container.scrollHeight

        if (currentScrollHeight > previousScrollHeight.current + 10) {
          setTimeout(() => {
            scrollToBottom()
            setTimeout(scrollToBottom, 100)
          }, 50)
        }
        previousScrollHeight.current = currentScrollHeight
      }
    })

    observer.observe(container)
    previousScrollHeight.current = container.scrollHeight

    return () => {
      observer.disconnect()
    }
  }, [scrollToBottom])

  useEffect(() => {
    const forceScrollToBottom = () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight + 5000

        setTimeout(() => {
          if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight + 5000
        }, 50)

        setTimeout(() => {
          if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight + 5000
        }, 150)

        setTimeout(() => {
          if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight + 5000
        }, 300)

        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight + 5000
            setShowScrollButton(false)
          }
        }, 500)
      }
    }

    const handleImageLoad = () => {
      forceScrollToBottom()
    }

    const setupImageLoadListeners = () => {
      if (containerRef.current) {
        const images = containerRef.current.querySelectorAll("img")

        images.forEach(img => {
          if (img.complete) {
            setTimeout(forceScrollToBottom, 100)
          } else {
            img.addEventListener("load", handleImageLoad)
          }

          img.addEventListener("error", handleImageLoad)
        })
      }
    }

    setupImageLoadListeners()
    setTimeout(setupImageLoadListeners, 300)

    const currentContainer = containerRef.current
    return () => {
      if (currentContainer) {
        const images = currentContainer.querySelectorAll("img")
        images.forEach(img => {
          img.removeEventListener("load", handleImageLoad)
          img.removeEventListener("error", handleImageLoad)
        })
      }
    }
  }, [messages])

  useEffect(() => {
    const ref = containerRef.current
    if (!ref) return
    ref.addEventListener("scroll", handleScroll)
    return () => ref.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  useEffect(() => {
    const handleResize = () => setTimeout(scrollToBottom, 100)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [scrollToBottom])

  return (
    <div
      ref={containerRef}
      className={cn("message-list-container relative h-full flex-1 overflow-y-auto px-1 pb-32 md:pb-14 pt-2", className)}
      style={{ scrollBehavior: "smooth" }}
    >
      {!visibleMessages?.length ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Welcome to Friday - Your ai friend!</p>
        </div>
      ) : (
        <div className="w-full space-y-4 md:px-4 lg:mx-auto lg:w-[90%] lg:px-0 xl:w-1/2">
          {visibleMessages.map((message, index) => {
            if (!message) return null;
            
            // Check if this is an image message with a media URL
            if (message.type === 'image') {
              return (
                <ImagePreview
                  key={`${message.id || index}-${message.timestamp}`}
                  message={message}
                  isFadingOut={isFadingOut && message.content === "thinking"}
                  onTransitionEnd={message.content === "thinking" ? handleTransitionEnd : undefined}
                />
              );
            } else if (message.type === 'audio' && message.mediaUrl) {
              return (
                <AudioPreview
                  key={`${message.id || index}-${message.timestamp}`}
                  message={message}
                  isFadingOut={isFadingOut && message.content === "thinking"}
                  onTransitionEnd={message.content === "thinking" ? handleTransitionEnd : undefined}
                />
              );
            } else if (message.type === 'video' && message.mediaUrl) {
              return (
                <VideoPreview
                  key={`${message.id || index}-${message.timestamp}`}
                  message={message}
                  isFadingOut={isFadingOut && message.content === "thinking"}
                  onTransitionEnd={message.content === "thinking" ? handleTransitionEnd : undefined}
                />
              );
            }
            return (
              <ChatMessage
                key={`${message.id || index}-${message.timestamp}`}
                message={message}
                chatId={chatId}
                index={index}
                isFadingOut={isFadingOut && message.content === "thinking"}
                onTransitionEnd={message.content === "thinking" ? handleTransitionEnd : undefined}
                selectedAI={currentModel}
              />
            );
          })}
          <div ref={messagesEndRef} className="h-20 w-full" />
        </div>
      )}
    </div>
  )
}

import * as React from "react"
import { cn, lt } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { ChatComposerActions } from "@/components/chat/composer/chat-composer-actions"
// import { ImagePreview } from "@/trash/chat-image-preview"
import { motion, useAnimationControls } from "framer-motion"
import { ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useComposerStore } from "@/store/composer-store"
import { useChatInputStore } from "@/store/chat-store"

const MotionTextarea = motion.create(Textarea)

export interface ChatComposerProps {
  className?: string
}

export function ChatComposer({
  className
}: ChatComposerProps) {
  const { chatState, chatId } = useChatInputStore()
  
  const { 
    value, setValue, 
    inputHeight,
    imagePreview, setImagePreview,
    textareaRef, minHeight,
  } = useComposerStore()

  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false)
  const [initialHeight, setInitialHeight] = React.useState(0)
  const [isMobileDevice, setIsMobileDevice] = React.useState(false)
  const [historyMessages, setHistoryMessages] = React.useState<string[]>([])
  const [historyIndex, setHistoryIndex] = React.useState(-1)
  const [tempValue, setTempValue] = React.useState("")
  const [activeCommand, setActiveCommand] = React.useState<string | null>(null)
  const [textareaHeight, setTextareaHeight] = React.useState<number>(0)
  const [showScrollButton, setShowScrollButton] = React.useState(false)
  
  const controls = useAnimationControls()

  React.useEffect(() => {
    if (chatState?.messages?.length > 0) {
      const userMessages = chatState.messages
        .filter(msg => msg.role === "user")
        .map(msg => msg.content)

      if (JSON.stringify(userMessages) !== JSON.stringify(historyMessages)) {
        setHistoryMessages(userMessages)
      }
    }
  }, [chatState.messages, historyMessages])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || ""
      const isMobileByUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      const isTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0
      const isNarrowScreen = window.innerWidth <= 768

      const mobileDetected = [isMobileByUA, isTouchScreen, isNarrowScreen].filter(Boolean).length >= 2
      setIsMobileDevice(mobileDetected)
    }
  }, [])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setInitialHeight(window.innerHeight)

      const handleResize = () => {
        const heightDifference = initialHeight - window.innerHeight
        const heightChangePercentage = (heightDifference / initialHeight) * 100

        if (heightChangePercentage > 25) {
          setIsKeyboardVisible(true)
        } else {
          setIsKeyboardVisible(false)
        }
      }

      const handleFocus = (e: FocusEvent) => {
        const target = e.target as HTMLElement
        if (target.id === "ai-input" && isMobileDevice) {
          setTimeout(() => setIsKeyboardVisible(true), 100)
        }
      }

      const handleBlur = () => {
        setTimeout(() => setIsKeyboardVisible(false), 100)
      }

      window.addEventListener("resize", handleResize)
      document.addEventListener("focusin", handleFocus)
      document.addEventListener("focusout", handleBlur)

      return () => {
        window.removeEventListener("resize", handleResize)
        document.removeEventListener("focusin", handleFocus)
        document.removeEventListener("focusout", handleBlur)
      }
    }
  }, [initialHeight, isMobileDevice])

  const positioningClasses = React.useMemo(() => {
    return isMobileDevice && isKeyboardVisible
      ? "fixed bottom-2" 
      : ""
  }, [isKeyboardVisible, isMobileDevice])

  React.useEffect(() => {
    const savedCommand = localStorage.getItem("activeCommand")
    if (savedCommand) {
      setActiveCommand(savedCommand)
    }
  }, [])

  const navigateHistory = (direction: "up" | "down"): void => {
    if (historyMessages.length === 0) return

    if (historyIndex === -1 && direction === "up") {
      setTempValue(value)
    }

    if (direction === "up") {
      if (historyIndex < historyMessages.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setValue(historyMessages[historyMessages.length - 1 - newIndex])
      }
    } else {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setValue(historyMessages[historyMessages.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setValue(tempValue)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const cursorPosition = e.currentTarget.selectionStart || 0
    const isAtStart = cursorPosition === 0
    const isAtEnd = cursorPosition === value.length

    if (e.key === "ArrowUp" && isAtStart && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      navigateHistory("up")
      return
    }

    if (e.key === "ArrowDown" && isAtEnd && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      navigateHistory("down")
      return
    }

    if (e.key === "Enter" && !e.shiftKey && !chatState.isLoading) {
      e.preventDefault()
      if (value.trim()) {
        console.log("Enter key pressed, submitting message")
        console.log("Current value:", value.trim(), "chatId:", chatId)
        
        const currentCommand = activeCommand
        setHistoryIndex(-1)

        // Check if chatId is available
        if (!chatId) {
          console.warn("No chatId found before submit via Enter key");
        }

        // Use the submit function from the store directly to ensure it has the latest context
        useComposerStore.getState().onSubmit();

        if (currentCommand) {
          localStorage.setItem("activeCommand", currentCommand)
        }
        return
      }
    }
  }

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = `${minHeight}px`
      const scrollHeight = textareaRef.current.scrollHeight
      const targetHeight = value.length < 20 ? minHeight : Math.min(scrollHeight, 300)
      
      setTextareaHeight(targetHeight)
      
      controls.start({
        height: targetHeight,
        transition: { duration: 0.15 }
      })
      
      textareaRef.current.style.height = `${targetHeight}px`
    }
  }, [value, controls, minHeight, textareaRef])

  React.useEffect(() => {
    if (textareaRef.current && activeCommand) {
      const textarea = textareaRef.current
      const handleScroll = () => setTextareaHeight(prev => prev)
      
      textarea.addEventListener("scroll", handleScroll)
      return () => textarea.removeEventListener("scroll", handleScroll)
    }
  }, [activeCommand, textareaRef])

  const scrollToBottom = React.useCallback(() => {
    const messageContainer = document.querySelector(".message-list-container")
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight + 2000
      setShowScrollButton(false)
    }
  }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      const messageContainer = document.querySelector(".message-list-container")
      if (messageContainer) {
        const { scrollTop, scrollHeight, clientHeight } = messageContainer
        const nearBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollButton(!nearBottom)
      }
    }

    const messageContainer = document.querySelector(".message-list-container")
    if (messageContainer) {
      messageContainer.addEventListener("scroll", handleScroll)
      return () => messageContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className={cn("absolute z-10 w-[95%] rounded-2xl border shadow-md lg:w-1/2 dark:shadow-none bottom-2 left-1/2 translate-x-[-50%]", positioningClasses, className)}>
      <Button
        onClick={scrollToBottom}
        className={cn(
          "absolute -top-12 left-1/2 -translate-x-1/2 rounded-full !p-0 shadow-lg transition-all duration-300 size-10",
          showScrollButton ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0"
        )}
        size="icon"
        variant="secondary"
      >
        <ChevronDown className="size-4" />
      </Button>

      {/* {imagePreview && (
        <ImagePreview
          imagePreview={imagePreview}
          inputHeight={inputHeight || 0}
          onRemove={() => setImagePreview(null)}
        />
      )} */}

      <div className="relative flex flex-col rounded-2xl bg-background">
        {/* <div className="w-full h-12 border-b px-3 text-sm flex flex-row space-x-1 items-center justify-start">
          <div className="h-8 w-8 rounded-md relative broder">
            <img src="/doraemon.jpg" className="h-full w-full rounded-md" />
            <div className="h-5 w-5 rounded-full border absolute -top-2.5 -right-2.5 flex items-center justify-center hover:bg-primary-foreground">
              <X className="h-3 w-3" />
            </div>
          </div>
        </div> */}

        <div className="relative">
          <MotionTextarea
            id="ai-input"
            value={value}
            placeholder={lt("input", "Ask me anything...")}
            disabled={chatState.isLoading}
            className={cn(
              "w-full resize-none border-none p-3 leading-normal tracking-wider focus-visible:ring-0 text-sm !bg-background rounded-tl-2xl rounded-tr-2xl",
              chatState.isLoading && "opacity-50",
            )}
            ref={textareaRef}
            animate={controls}
            initial={{ height: minHeight }}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setValue(e.target.value)
              setHistoryIndex(-1)
            }}
            style={{
              minHeight: `${minHeight}px`,
              maxHeight: "300px",
              overflowY: "auto",
              lineHeight: "1.5",
            }}
          />
        </div>
        <ChatComposerActions />
      </div>
    </div>
  )
}

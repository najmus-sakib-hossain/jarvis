"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  ChevronDown,
  CircleStop,
  Mic,
  Paperclip,
  Radio,
  Sparkles,
  Webcam,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useChatInputStore } from "@/store/chat-store";
import { useComposerStore } from "@/store/composer-store";
import {
  useChatOptionsStore,
  MediaCategoryKey,
} from "@/store/chat-options-store";
import { ChatOptions } from "@/components/chat/composer/chat-options";
import { ChatTools } from "@/components/chat/composer/chat-tools";

export function ChatComposerActions() {
  const { isStreaming, chatState, chatId } = useChatInputStore();
  const { value, onSubmit, setValue } = useComposerStore();
  const { setSelectedMedia } = useChatOptionsStore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [filePopoverOpen, setFilePopoverOpen] = useState(false);

  const enhancePrompt = async () => {
    setIsLoading(true);
    try {
      const currentPrompt = value.trim();
      let instructionForAI: string;
      let generatedMediaType: MediaCategoryKey = "text";

      if (currentPrompt) {
        instructionForAI = `Please rewrite and improve the following prompt to make it clearer, more specific, and easier for an AI to understand. Focus on improving structure, specificity, and clarity. Return ONLY the improved prompt with no explanations or additional text:\n\n${currentPrompt}`;
      } else {
        const mediaTypes: MediaCategoryKey[] = ["text", "image", "audio", "video"];
        generatedMediaType =
          mediaTypes[Math.floor(Math.random() * mediaTypes.length)];

        const promptTypeMap: Record<MediaCategoryKey, string> = {
          text: "a short story or a detailed article",
          image: "an AI image generator",
          audio: "an AI audio or music generator",
          video: "an AI video generator",
        };
        instructionForAI = `Generate one random, creative, and interesting prompt suitable for ${promptTypeMap[generatedMediaType]}. The prompt should be a single, complete sentence. Return only the prompt itself.`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: [],
          mediaCategory: "text",
          model: "gemma-3-1b-it",
          message: instructionForAI,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || "Failed to get a valid response from the AI."
        );
      }

      const enhancedText = await response.text();
      setValue(enhancedText.trim());

      if (!currentPrompt) {
        setSelectedMedia(generatedMediaType);
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitClick = () => {
    if (!value.trim()) {
      toast({
        title: "Cannot send empty message",
        variant: "destructive",
      });
      return;
    }

    if (isLoading || chatState.isLoading) {
      toast({
        title: "Processing in progress",
        description: "Please wait for the current operation to complete.",
      });
      return;
    }

    try {
      if (typeof onSubmit === "function") {
        onSubmit();
      } else {
        throw new Error("Submit handler is not properly configured.");
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
    }
  };

  const renderActionIcon = (
    icon: React.ReactNode,
    tooltipText: string,
    mobileOnly = false
  ) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className={cn(
            "flex size-7 items-center justify-center rounded-full border text-muted-foreground hover:bg-secondary hover:text-primary",
            mobileOnly ? "flex md:hidden" : "hidden md:flex"
          )}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
        >
          {icon}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
  // <ChatTools />

  return (
    <div className="relative flex h-12 flex-row justify-between rounded-b-xl border-t px-2.5">
      <div className="flex h-full flex-row items-center gap-1.5">
        <ChatOptions />
      </div>

      <div className="absolute bottom-1 left-1/2 flex h-10 -translate-x-1/2 flex-row items-center justify-center gap-1 rounded-full border p-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className="flex size-7 items-center justify-center rounded-full border text-muted-foreground hover:bg-secondary hover:text-primary"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
            >
              <Mic className="size-4" />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Instant Audio input is coming soon...</p>
          </TooltipContent>
        </Tooltip>
        {renderActionIcon(
          <Camera className="size-4" />,
          "Instant Image input is coming soon..."
        )}
        {renderActionIcon(
          <Webcam className="size-4" />,
          "Instant Video input is coming soon..."
        )}
        {renderActionIcon(
          <ChevronDown className="size-4" />,
          "Instant actions input is coming soon...",
          true
        )}
      </div>

      <div className="flex h-full flex-row items-center gap-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              type="button"
              onClick={enhancePrompt}
              disabled={isLoading}
              className="flex h-8 items-center justify-center gap-1.5 rounded-full border border-transparent text-muted-foreground transition-all hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
              >
                <Sparkles className="size-4" />
              </motion.div>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Enhance prompt for better AI understanding</p>
          </TooltipContent>
        </Tooltip>

        <Dialog open={filePopoverOpen} onOpenChange={setFilePopoverOpen}>
          <DialogTrigger asChild disabled={isLoading}>
            <motion.div
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-full p-0",
                // chatState.currentMediaType === "image" &&
                //   "border bg-background text-primary",
                // isLoading && "cursor-not-allowed opacity-50"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Paperclip
                className={cn(
                  "size-4 text-muted-foreground transition-colors hover:text-primary",
                  // chatState.currentMediaType === "image" && "text-primary"
                )}
              />
            </motion.div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl overflow-hidden border bg-background/95 p-0 shadow-lg backdrop-blur-md">
            <DialogHeader className="border-b p-4">
              <DialogTitle className="text-xl font-medium">
                Attach Files is coming soon...
              </DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <motion.button
          type="button"
          onClick={handleSubmitClick}
          disabled={!value.trim() || isLoading || chatState.isLoading}
          className="flex size-8 items-center justify-center rounded-full border-none bg-primary text-primary-foreground transition-colors hover:bg-foreground hover:text-background disabled:p-0"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading || isStreaming || chatState.isLoading ? (
            <CircleStop className="min-h-5 min-w-5" strokeWidth={3} />
          ) : (
            <Radio className="size-4" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
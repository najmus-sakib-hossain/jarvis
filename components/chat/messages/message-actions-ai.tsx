import * as React from "react";
import { Copy, ThumbsDown, ThumbsUp, Volume2, RotateCcw, Play, Pause, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { MoreActions } from "@/components/chat/messages/message-more-options";
import { Progress } from "@/components/ui/progress";

interface AiMessageProps {
  content: string;
  onLike?: () => void;
  onDislike?: () => void;
  reactions?: {
    likes: number;
    dislikes: number;
  };
  className?: string;
  onWordIndexUpdate?: (index: number) => void;
  onPlayStateChange?: (isPlaying: boolean, audio: HTMLAudioElement | null) => void;
}

type TTSCache = Record<string, {
  audio: HTMLAudioElement;
  url: string;
  timestamp: number;
}>;

type PlaybackProgress = {
  chunkIndex: number;
  currentTime: number;
};

const ttsAudioCache: TTSCache = {};

function createContentHash(content: string): string {
  const trimmedContent = content?.substring(0, 100) || "";
  let hash = 0;
  for (let i = 0; i < trimmedContent.length; i++) {
    const char = trimmedContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "tts_" + Math.abs(hash).toString(16);
}

function splitTextIntoChunks(text: string, maxLength = 500): string[] {
  if (!text || typeof text !== "string") return [];
  return [text]; // Single chunk
}

export default function AiMessage({
  content,
  onLike,
  onDislike,
  reactions,
  className,
  onWordIndexUpdate,
  onPlayStateChange
}: AiMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [audioQueue, setAudioQueue] = useState<HTMLAudioElement[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);
  const [fetchedChunks, setFetchedChunks] = useState<(HTMLAudioElement | null)[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentHash = useRef<string>(createContentHash(content));
  const isMounted = useRef(true);
  const hasFetchedNext = useRef(false);

  // Use refs for function stability with useCallback
  const playNextAudioRef = useRef<(initialAudio?: HTMLAudioElement) => void>(undefined);
  const handleAudioEndRef = useRef<() => void>(undefined);

  const getTextFromContainer = useCallback((): string => {
    const parentElement = containerRef.current?.closest(".markdown-content");
    if (parentElement) {
      return (parentElement as HTMLElement).innerText || "";
    }
    return content
      .replace(/[#]+/g, "")
      .replace(/[*_-]{1,}/g, "")
      .replace(/`[^`]*`/g, "")
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, "")
      .replace(/\[[^\]]*\]\([^\)]*\)/g, "")
      .replace(/[\n\r]/g, " ")
      .trim();
  }, [content]);

  const fetchTTS = useCallback(async (text: string, chunkIndex: number): Promise<HTMLAudioElement | null> => {
    if (!isMounted.current || !text || typeof text !== "string") return null;

    const cacheKey = `${contentHash.current}_${chunkIndex}_${text.length}`;
    if (ttsAudioCache[cacheKey]) {
      ttsAudioCache[cacheKey].timestamp = Date.now();
      return ttsAudioCache[cacheKey].audio;
    }

    try {
      setIsLoading(true);
      const response = await fetch("https://friday-backend.vercel.app/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Origin": window.location.origin
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);

      if (isMounted.current) {
        ttsAudioCache[cacheKey] = {
          audio: newAudio,
          url: audioUrl,
          timestamp: Date.now()
        };
      }

      return newAudio;
    } catch (error) {
      toast.error(`Failed to fetch audio for chunk ${chunkIndex}`);
      return null;
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [contentHash]);

  const handleMetadata = useCallback(() => {
    setShowProgress(true);
  }, []);

  const handleAudioError = useCallback(() => {
    setCurrentAudio(null);
    setIsPlaying(false);
    setIsCompleted(true);
    setShowProgress(false);
    onPlayStateChange?.(false, null);
    toast.error("Audio playback error occurred");
  }, [onPlayStateChange]);

  const fetchNextChunk = useCallback(async (chunkIndex: number) => {
    if (chunkIndex >= chunks.length || fetchedChunks[chunkIndex]) return;

    try {
      const audio = await fetchTTS(chunks[chunkIndex], chunkIndex);
      if (!audio || !isMounted.current) return;

      setFetchedChunks(prev => {
        const newFetched = [...prev];
        newFetched[chunkIndex] = audio;
        return newFetched;
      });
      setAudioQueue(prev => [...prev, audio]);
    } catch (error) {
      toast.error("Failed to load next audio segment");
    }
  }, [chunks, fetchTTS, fetchedChunks]);

  const handleTimeUpdate = useCallback((e: Event) => {
    const audio = e.target as HTMLAudioElement;
    if (!isMounted.current || !audio) return;

    if (isNaN(audio.duration) || audio.duration === 0) return;

    const progress = (audio.currentTime / audio.duration) * 100;
    const progressPercentage = Math.min(Math.round(progress), 100);
    setPlaybackProgress(progressPercentage);

    if (!showProgress) {
      setShowProgress(true);
    }

    if (progress >= 50 && !hasFetchedNext.current && currentChunkIndex + 1 < chunks.length) {
      hasFetchedNext.current = true;
      fetchNextChunk(currentChunkIndex + 1);
    }

    const progressData: PlaybackProgress = {
      chunkIndex: currentChunkIndex,
      currentTime: audio.currentTime
    };
    localStorage.setItem(`tts_progress_${contentHash.current}`, JSON.stringify(progressData));
  }, [chunks.length, contentHash, currentChunkIndex, fetchNextChunk, showProgress]);

  // Define handleAudioEnd without referencing playNextAudio directly
  const handleAudioEnd = useCallback(() => {
    if (!isMounted.current) return;

    setIsPlaying(false);
    setPlaybackProgress(100);
    setCurrentAudio(null);

    const hasMoreChunks = currentChunkIndex + 1 < chunks.length;
    const hasQueuedAudio = audioQueue.length > 0;

    if (!hasMoreChunks && !hasQueuedAudio) {
      setIsCompleted(true);
      setShowProgress(false);
      onPlayStateChange?.(false, null);
      localStorage.removeItem(`tts_progress_${contentHash.current}`);
    } else if (hasQueuedAudio) {
      playNextAudioRef.current?.();
    } else if (hasMoreChunks) {
      fetchNextChunk(currentChunkIndex + 1).then(() => {
        if (audioQueue.length > 0) playNextAudioRef.current?.();
      });
    }
  }, [currentChunkIndex, chunks.length, audioQueue.length, contentHash, fetchNextChunk, onPlayStateChange]);

  // Define playNextAudio without referencing handleAudioEnd directly
  const playNextAudio = useCallback((initialAudio?: HTMLAudioElement): void => {
    if (!isMounted.current) return;

    const audioToPlay = initialAudio || audioQueue[0];
    if (!audioToPlay) {
      setIsPlaying(false);
      setCurrentAudio(null);
      setIsCompleted(true);
      setShowProgress(false);
      onPlayStateChange?.(false, null);
      localStorage.removeItem(`tts_progress_${contentHash.current}`);
      return;
    }

    if (!initialAudio) {
      setAudioQueue(prev => prev.slice(1));
    }

    setCurrentAudio(audioToPlay);
    setCurrentChunkIndex(prev => initialAudio ? prev : prev + 1);
    setIsCompleted(false);
    setShowProgress(true);
    hasFetchedNext.current = false;

    const savedProgress = localStorage.getItem(`tts_progress_${contentHash.current}`);
    if (savedProgress) {
      const progress: PlaybackProgress = JSON.parse(savedProgress);
      if (progress.chunkIndex === currentChunkIndex && progress.currentTime > 0) {
        audioToPlay.currentTime = progress.currentTime;
      }
    }

    audioToPlay.addEventListener("timeupdate", handleTimeUpdate);
    audioToPlay.addEventListener("ended", () => handleAudioEndRef.current?.());
    audioToPlay.addEventListener("loadedmetadata", handleMetadata);
    audioToPlay.addEventListener("error", handleAudioError);

    audioToPlay.play()
      .then(() => {
        setIsPlaying(true);
        onPlayStateChange?.(true, audioToPlay);
      })
      .catch(() => {
        toast.error("Failed to play audio");
        setCurrentAudio(null);
        setIsPlaying(false);
      });
  }, [audioQueue, contentHash, currentChunkIndex, handleAudioError, handleMetadata, handleTimeUpdate, onPlayStateChange]);

  // Set each callback on its ref after definition
  useEffect(() => {
    playNextAudioRef.current = playNextAudio;
  }, [playNextAudio]);

  useEffect(() => {
    handleAudioEndRef.current = handleAudioEnd;
  }, [handleAudioEnd]);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`tts_progress_${contentHash.current}`);
    if (savedProgress) {
      const progress: PlaybackProgress = JSON.parse(savedProgress);
      const plainText = getTextFromContainer();
      const text = formatToSingleLine(plainText);
      const textChunks = text.length > 500 ? splitTextIntoChunks(text, 500) : [text];
      if (progress.chunkIndex >= textChunks.length) {
        localStorage.removeItem(`tts_progress_${contentHash.current}`);
        setCurrentChunkIndex(0);
      } else {
        setCurrentChunkIndex(progress.chunkIndex);
      }
    }
  }, [content, getTextFromContainer]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.removeEventListener("timeupdate", handleTimeUpdate);
        currentAudio.removeEventListener("ended", handleAudioEnd);
        currentAudio.removeEventListener("loadedmetadata", handleMetadata);
        currentAudio.removeEventListener("error", handleAudioError);
      }
      audioQueue.forEach(audio => audio.pause());
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [audioQueue, currentAudio, handleAudioEnd, handleAudioError, handleTimeUpdate, handleMetadata]);

  // Cache cleanup
  useEffect(() => {
    const now = Date.now();
    const CACHE_TTL = 30 * 60 * 1000;
    Object.keys(ttsAudioCache).forEach(key => {
      if (now - ttsAudioCache[key].timestamp > CACHE_TTL) {
        URL.revokeObjectURL(ttsAudioCache[key].url);
        delete ttsAudioCache[key];
      }
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `friday-response-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const detectLanguage = (text: string): string => {
    if (!text) return "en-US";
    if (/[áéíóúñ¿¡]/.test(text)) return "es-MX";
    if (/[àâçéèêëîïôûùüÿœ]/.test(text)) return "fr-FR";
    if (/[äöüß]/.test(text)) return "de-DE";
    if (/[а-яА-Я]/.test(text)) return "ru-RU";
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text) || /[\u4E00-\u9FFF]/.test(text)) return "ja-JP";
    if (/[\u4E00-\u9FFF]/.test(text) && !/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return "zh-CN";
    return "en-US";
  };

  const formatToSingleLine = (text: string): string => {
    if (!text || typeof text !== "string") return "";
    return text
      .replace(/[\n\r]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleSpeech = async () => {
    if (!isMounted.current) return;

    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false, currentAudio);
      return;
    }

    if (!isPlaying && currentAudio) {
      currentAudio.play()
        .then(() => {
          setIsPlaying(true);
          setShowProgress(true);
          onPlayStateChange?.(true, currentAudio);
        })
        .catch(err => console.error("Resume failed:", err));
      return;
    }

    const plainText = getTextFromContainer();
    if (!plainText) {
      toast.error("No text content available");
      return;
    }

    const text = formatToSingleLine(plainText);
    const textChunks = [text];
    const cacheKey = `${contentHash.current}_0_${text.length}`;

    if (ttsAudioCache[cacheKey]) {
      setChunks(textChunks);
      setFetchedChunks([ttsAudioCache[cacheKey].audio]);
      setCurrentChunkIndex(0);
      setIsCompleted(false);
      setPlaybackProgress(0);
      setShowProgress(false);
      playNextAudio(ttsAudioCache[cacheKey].audio);
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      setChunks(textChunks);
      setFetchedChunks(new Array(textChunks.length).fill(null));
      setIsCompleted(false);
      setCurrentChunkIndex(0);
      setPlaybackProgress(0);
      setShowProgress(false);

      const audio = await fetchTTS(textChunks[0], 0);
      if (!audio) throw new Error("Failed to fetch initial audio");

      setFetchedChunks(prev => {
        const newFetched = [...prev];
        newFetched[0] = audio;
        return newFetched;
      });

      playNextAudio(audio);
    } catch (error) {
      toast.error("Failed to initiate audio playback");
      setIsLoading(false);

      if (!window.speechSynthesis || !isMounted.current) return;

      const detectedLang = detectLanguage(plainText);
      const voices = window.speechSynthesis.getVoices();
      const newUtterance = new SpeechSynthesisUtterance(text);
      newUtterance.lang = detectedLang;

      const matchingVoice = voices.find(voice => voice.lang === detectedLang) ||
        voices.find(voice => voice.lang.startsWith(detectedLang.split("-")[0]));
      if (matchingVoice) newUtterance.voice = matchingVoice;

      newUtterance.onend = () => {
        if (isMounted.current) {
          setIsPlaying(false);
          setIsCompleted(true);
          onPlayStateChange?.(false, null);
        }
      };

      window.speechSynthesis.speak(newUtterance);
      setIsPlaying(true);
      onPlayStateChange?.(true, null);
    }
  };

  const handleRegenerate = () => {
    // Placeholder for regeneration functionality
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "bg-background/95 flex max-h-14 flex-wrap items-center gap-0.5 rounded-lg p-1.5 px-0 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center">
        <button
          onClick={handleCopy}
          className="hover:bg-muted rounded-full p-1.5 transition-colors"
        >
          <Copy className="size-3.5" />
        </button>

        <button
          onClick={handleSpeech}
          className="hover:bg-muted flex size-6 items-center justify-center rounded-full transition-colors"
        >
          {isLoading ? (
            <Loader className="size-3.5 animate-spin" />
          ) : isCompleted ? (
            <Volume2 className="size-[17px]" />
          ) : isPlaying && currentAudio ? (
            <Pause className="size-3.5" />
          ) : currentAudio ? (
            <Play className="size-3.5" />
          ) : (
            <Volume2 className="size-[17px]" />
          )}
        </button>

        <button
          onClick={onLike}
          className={cn(
            "hover:bg-muted flex items-center gap-1 rounded-full p-1.5 transition-colors",
            reactions?.likes && "text-primary"
          )}
        >
          <ThumbsUp className="size-3.5" />
          {reactions?.likes && reactions.likes > 0 && (
            <span className="text-xs tabular-nums">{reactions.likes}</span>
          )}
        </button>

        <button
          onClick={onDislike}
          className={cn(
            "hover:bg-muted flex items-center gap-1 rounded-full p-1.5 transition-colors",
            reactions?.dislikes && "text-destructive"
          )}
        >
          <ThumbsDown className="size-3.5" />
          {reactions?.dislikes && reactions.dislikes > 0 && (
            <span className="text-xs tabular-nums">{reactions.dislikes}</span>
          )}
        </button>

        <button
          onClick={handleRegenerate}
          className="hover:bg-muted rounded-full p-1.5 transition-colors"
        >
          <RotateCcw className="size-3.5" />
        </button>

        <MoreActions content={content} />
      </div>
    </motion.div>
  );
}

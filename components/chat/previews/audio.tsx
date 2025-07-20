import React from 'react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserIcon, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPreviewProps {
  message: Message;
  isFadingOut?: boolean;
  onTransitionEnd?: () => void;
}

export function AudioPreview({ message, isFadingOut, onTransitionEnd }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const isUser = message.role === 'user';
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  React.useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      const handleEnded = () => setIsPlaying(false);
      audioElement.addEventListener('ended', handleEnded);
      return () => {
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, []);
  
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
        
        <div className="w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-900 to-purple-900 p-4">
          {message.mediaData?.thumbnailUrl && (
            <div className="mb-4 opacity-50">
              <img 
                src={message.mediaData.thumbnailUrl} 
                alt="Audio visualization"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <Button 
              variant="secondary" 
              size="icon" 
              className="size-12 rounded-full"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="size-6" /> : <Play className="size-6" />}
            </Button>
            
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
              <div className="bg-white h-full w-0" id="audio-progress"></div>
            </div>
          </div>
          
          <audio ref={audioRef} src={message.mediaUrl} className="hidden" />
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

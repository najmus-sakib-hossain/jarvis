"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ChevronRight, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'
// import { doc, setDoc } from "firebase/firestore"
// import { db } from "@/lib/firebase/config"
// import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useAIModelStore } from "@/store/ai-model-store"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SearchSuggestionProps {
  inputValue: string;
  onSuggestionSelect?: (suggestion: string) => void;
}

// Helper function to aggressively clean text formatting
const cleanSuggestionText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/\r\n|\r|\n/g, ' ')    // Replace all types of line breaks with spaces
    .replace(/\s{2,}/g, ' ')        // Replace multiple spaces with a single space
    .replace(/\t/g, ' ')            // Replace tabs with spaces
    .replace(/\u00A0/g, ' ')        // Replace non-breaking spaces with regular spaces
    .trim();                        // Remove leading/trailing whitespace
}

export default function SearchSuggestions({ inputValue, onSuggestionSelect }: SearchSuggestionProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomObserverRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef<string>("");
  const router = useRouter();
  // const { user } = useAuth();
  const { currentModel } = useAIModelStore();

  // Reset pagination when input changes
  useEffect(() => {
    setSuggestions([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setIsVisible(true);
    lastQueryRef.current = inputValue;
  }, [inputValue]);
  
  // Handle intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchMoreSuggestions();
        }
      },
      { threshold: 0.5 }
    );

    if (bottomObserverRef.current) {
      observer.observe(bottomObserverRef.current);
    }

    return () => {
      if (bottomObserverRef.current) {
        observer.unobserve(bottomObserverRef.current);
      }
    };
  }, [hasMore, isLoading, inputValue, page]);

  // Fetch initial suggestions
  useEffect(() => {
    if (inputValue && inputValue.trim().length >= 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [inputValue]);

  // Fetch more suggestions when scrolling - with improved error handling
  const fetchMoreSuggestions = async () => {
    if (isLoading || !hasMore || !inputValue.trim()) return;
    
    const nextPage = page + 1;
    setIsLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(inputValue.trim())}&page=${nextPage}`, {
        signal: controller.signal
      }).catch(err => {
        throw new Error(`Network error: ${err.message}`);
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle HTTP error but don't throw
        console.warn(`API returned ${response.status}: ${response.statusText}`);
        setHasMore(false);
        return;
      }
      
      const data = await response.json();
      
      if (data?.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        const newSuggestions = data.suggestions
          .map((suggestion: string): string => cleanSuggestionText(suggestion))
          .filter((text: string): boolean => 
            text.length > 0 && !suggestions.includes(text)
          );
        
        if (newSuggestions.length > 0) {
          setSuggestions(prev => [...prev, ...newSuggestions]);
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      // Handle error gracefully
      console.warn('Error fetching more suggestions:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Main function to fetch suggestions - with improved error handling
  const fetchSuggestions = async () => {
    if (!inputValue || inputValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Add timeout and AbortController for fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Request Google search suggestions via our own API to avoid CORS issues
      const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(inputValue.trim())}&page=1`, {
        signal: controller.signal
      }).catch(err => {
        if (err.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw new Error(`Network error: ${err.message}`);
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Gracefully handle HTTP errors without throwing
        console.warn(`API returned ${response.status}: ${response.statusText}`);
        // Don't show error for no suggestions
        setSuggestions([]);
        return;
      }
      
      const data = await response.json();
      
      if (data?.suggestions && Array.isArray(data.suggestions)) {
        const formattedSuggestions: string[] = data.suggestions
          .map((suggestion: string): string => cleanSuggestionText(suggestion))
          .filter((text: string): boolean => text.length > 0);
          
        if (formattedSuggestions.length > 0) {
          setSuggestions(formattedSuggestions);
          setHasMore(data.hasMore !== false);
        } else {
          // Just set empty suggestions without error
          setSuggestions([]);
        }
      } else {
        // Don't use fallback suggestions, just set empty array
        setSuggestions([]);
        setHasMore(false);
      }
    } catch (error: any) {
      // Handle error gracefully without fallback suggestions
      console.warn('Error fetching search suggestions:', error);
      setSuggestions([]);
      setHasMore(false);
      // Only set critical errors
      if (error.message !== 'No suggestions available') {
        setError('Failed to fetch suggestions');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle fetch errors with fade-out animation
  const handleFetchError = (errorMessage: string) => {
    // Don't show error for no suggestions
    if (errorMessage === 'Could not retrieve suggestions') {
      setSuggestions([]);
      return;
    }
    
    setError(errorMessage);
    
    // Trigger fade-out animation
    setTimeout(() => {
      setIsVisible(false);
      
      // Reset after animation completes
      setTimeout(() => {
        setError(null);
        setSuggestions([]);
        setHasMore(false);
        setIsVisible(true);
      }, 300); // Match the CSS transition duration
    }, 1500); // Show error message for 1.5 seconds
  };

  // Handle suggestion click - either use the callback or create a new chat
  const handleSuggestionClick = async (suggestion: string) => {
    // If parent component provided a handler, use it
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
      return;
    }
    
    // Otherwise, create a new chat - no authentication check
    try {
      const chatId = uuidv4();
      
      // Create initial message
      const initialMessage = {
        id: uuidv4(),
        content: suggestion,
        role: 'user',
        timestamp: new Date().toISOString()
      };

      // Create initial chat data with guest user
      const chatData = {
        id: chatId,
        title: suggestion.slice(0, 50) + (suggestion.length > 50 ? '...' : ''),
        messages: [initialMessage],
        model: currentModel,
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creatorUid: "guest-user", // Use guest user ID
        reactions: {
          likes: {},
          dislikes: {}
        },
        participants: ["guest-user"],
        views: 0,
        uniqueViewers: [],
        isPinned: false
      };

      // Store chat data in Firestore
      // await setDoc(doc(db, "chats", chatId), chatData);

      // Store session data for auto-submission
      sessionStorage.setItem('initialPrompt', suggestion);
      sessionStorage.setItem('selectedAI', currentModel);
      sessionStorage.setItem('chatId', chatId);
      sessionStorage.setItem('autoSubmit', 'true');

      // Navigate to chat page
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  };

  // Updated function to render suggestion with properly cleaned text
  const renderHighlightedSuggestion = (suggestion: string, inputValue: string) => {
    // Clean the suggestion text again before rendering as a safety measure
    const formattedSuggestion = cleanSuggestionText(suggestion);
    
    if (!inputValue.trim()) {
      return <span className="inline-block w-full whitespace-normal break-words">{formattedSuggestion}</span>;
    }

    const normalizedInput = inputValue.toLowerCase().trim();
    const normalizedSuggestion = formattedSuggestion.toLowerCase();
    
    let matchIndex = normalizedSuggestion.indexOf(normalizedInput);
    
    // If the input doesn't match the beginning of the suggestion, but a word in it
    if (matchIndex === -1) {
      const words = normalizedInput.split(' ');
      for (const word of words) {
        if (word.length > 2) { // Only consider meaningful words
          matchIndex = normalizedSuggestion.indexOf(word);
          if (matchIndex !== -1) break;
        }
      }
    }
    
    if (matchIndex === -1) {
      // No match found, just show the whole suggestion
      return <span className="inline-block w-full whitespace-normal break-words">{formattedSuggestion}</span>;
    }
    
    const beforeMatch = formattedSuggestion.slice(0, matchIndex);
    const match = formattedSuggestion.slice(matchIndex, matchIndex + inputValue.trim().length);
    const afterMatch = formattedSuggestion.slice(matchIndex + inputValue.trim().length);
    
    return (
      <span className="inline-block w-full">
        <span className="text-muted-foreground">{beforeMatch}</span>
        <span className="text-primary font-medium">{match}</span>
        <span>{afterMatch}</span>
      </span>
    );
  };

  return (
    <>
      {(suggestions.length > 0 || (inputValue.trim().length > 1 && isLoading) || 
        (error && error !== 'No suggestions available')) ? (
        <div 
          className={`w-[95%] xl:w-1/2 mx-auto shadow-2xl dark:shadow-none border-border rounded-lg backdrop-blur-sm border overflow-hidden bg-background/90 transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-full">
            <ScrollArea className="h-[300px] w-full">
              <div className="flex w-full flex-col">
                {error ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground gap-2">
                    <AlertCircle className="h-6 w-6 text-amber-500" />
                    <div>{error}</div>
                  </div>
                ) : isLoading && page === 1 ? (
                  <div className="flex justify-center h-[300px] items-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={cn(
                          "group flex cursor-pointer items-center px-5 py-3.5 transition-colors hover:bg-secondary/50",
                          index !== suggestions.length - 1 ? "border-b border-border/50" : ""
                        )}
                      >
                        <Search className="size-4 text-muted-foreground shrink-0 mr-4" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          {renderHighlightedSuggestion(suggestion, inputValue)}
                        </div>
                        <ChevronRight className="size-4 opacity-0 text-muted-foreground transition-opacity group-hover:opacity-100 shrink-0 ml-2" />
                      </div>
                    ))}

                    {/* Bottom observer for infinite scroll */}
                    <div ref={bottomObserverRef} className="h-10 w-full flex justify-center items-center">
                      {isLoading && page > 1 ? (
                        <div className="py-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        </div>
                      ) : hasMore ? (
                        <div className="text-xs text-muted-foreground py-2">Scroll for more suggestions</div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </div>
      ) : null}
    </>
  );
}

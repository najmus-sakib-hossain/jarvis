"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ModelInfo {
  id: string;
  name: string;
  rpm: number;
  dailyLimit: number;
}

interface RequestTracker {
  [modelId: string]: {
    dailyCount: number;
    lastReset: string;
    requestTimestamps: number[];
  }
}

const availableModels: ModelInfo[] = [
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Fast)", rpm: 15, dailyLimit: 1500 },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite (Fast)", rpm: 30, dailyLimit: 1500 },
    { id: "gemma-3n-e4b-it", name: "Gemma 3n E4B", rpm: 30, dailyLimit: 14400 },
    { id: "gemma-3-27b-it", name: "Gemma 3 (27B)", rpm: 30, dailyLimit: 14400 },
    { id: "gemma-3-12b-it", name: "Gemma 3 (12B)", rpm: 30, dailyLimit: 14400 },
    { id: "gemma-3-4b-it", name: "Gemma 3 (4B)", rpm: 30, dailyLimit: 14400 },
    { id: "gemma-3-1b-it", name: "Gemma 3 (1B)", rpm: 30, dailyLimit: 14400 },
    { id: "gemini-1.5-flash-8b", name: "Gemini 1.5 Flash (8B)", rpm: 15, dailyLimit: 1500 },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", rpm: 15, dailyLimit: 1500 },
    { id: "gemini-2.0-flash-preview-image-generation", name: "Gemini 2.0 Image Gen", rpm: 10, dailyLimit: 1500 },
    { id: "gemini-2.5-flash-preview-04-17", name: "Gemini 2.5 Flash Preview (04-17)", rpm: 10, dailyLimit: 500 },
    { id: "gemini-2.5-pro-preview-05-06", name: "Gemini 2.5 Pro Preview (05-06)", rpm: 10, dailyLimit: 500 },
    { id: "learnlm-2.0-flash-experimental", name: "LearnLM 2.0 Flash Exp.", rpm: 15, dailyLimit: 1500 },
];

export const Chat: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>("gemma-3n-e4b-it");
  const [requestTracker, setRequestTracker] = useState<RequestTracker>({});
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const textBufferRef = useRef("");
  const updateScheduledRef = useRef(false);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const savedTracker = localStorage.getItem('geminiRequestTracker');
      if (savedTracker) setRequestTracker(JSON.parse(savedTracker));
    } catch (e) {
      console.error("Failed to access localStorage", e);
    }
    return () => {
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('geminiRequestTracker', JSON.stringify(requestTracker));
    } catch (e) {
      console.error("Failed to save request tracker to localStorage", e);
    }
  }, [requestTracker]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    setError(null);
    
    const modelInfo = availableModels.find(m => m.id === selectedModelId)!;
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    let modelTracker = requestTracker[modelInfo.id] || { dailyCount: 0, lastReset: today, requestTimestamps: [] };
    if (modelTracker.lastReset !== today) {
        modelTracker = { dailyCount: 0, lastReset: today, requestTimestamps: [] };
    }
    if (modelTracker.dailyCount >= modelInfo.dailyLimit) {
        setError(`Daily request limit for ${modelInfo.name} reached.`);
        return;
    }
    const oneMinuteAgo = now - 60000;
    const recentRequests = modelTracker.requestTimestamps.filter(ts => ts > oneMinuteAgo);
    if (recentRequests.length >= modelInfo.rpm) {
        setError(`Rate limit of ${modelInfo.rpm} RPM for ${modelInfo.name} exceeded. Wait a moment.`);
        return;
    }
    
    setIsLoading(true);
    
    const newUserMessage: ChatMessage = { role: "user", parts: [{ text: userInput }] };
    const updatedChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedChatHistory);
    setUserInput("");
    
    const apiHistory = updatedChatHistory.map(({ role, parts }) => ({ role, parts }));
    
    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: modelInfo.id, contents: apiHistory }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      setRequestTracker(prev => ({
          ...prev,
          [modelInfo.id]: {
              ...modelTracker,
              dailyCount: modelTracker.dailyCount + 1,
              requestTimestamps: [...recentRequests, now]
          }
      }));

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get response reader.");
      
      const decoder = new TextDecoder();
      setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "" }] }]);

      const flushBufferToState = () => {
        if (textBufferRef.current) {
          const accumulatedText = textBufferRef.current;
          textBufferRef.current = "";
          setChatHistory(prev =>
            prev.map((msg, index) =>
              index === prev.length - 1
                ? { ...msg, parts: [{ text: msg.parts[0].text + accumulatedText }] }
                : msg
            )
          );
        }
        updateScheduledRef.current = false;
        timerIdRef.current = null;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (timerIdRef.current) clearTimeout(timerIdRef.current);
          flushBufferToState();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonString = line.substring(6);
              const parsed = JSON.parse(jsonString);
              const textChunk = parsed.text;
              if (textChunk) {
                textBufferRef.current += textChunk;
                if (!updateScheduledRef.current) {
                  updateScheduledRef.current = true;
                  timerIdRef.current = setTimeout(flushBufferToState, 100);
                }
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Error: ${errorMessage}`);
      setChatHistory(prev => prev.filter(msg => msg !== newUserMessage));
    } finally {
      setIsLoading(false);
    }
  };
 
  const currentModelInfo = availableModels.find(m => m.id === selectedModelId);
  const today = new Date().toISOString().split('T')[0];
  const dailyCount = (requestTracker[selectedModelId]?.lastReset === today) ? (requestTracker[selectedModelId]?.dailyCount || 0) : 0;

  return (
    <main className="bg-background text-foreground flex flex-col h-screen font-sans">
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-foreground mb-4">Friday</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                  <label htmlFor="model-select" className="block text-sm font-medium text-muted-foreground mb-1">Select Model</label>
                   <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                      <SelectTrigger><SelectValue placeholder="Select a model" /></SelectTrigger>
                      <SelectContent>
                          {availableModels.map(model => (
                              <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <div className="text-muted-foreground text-sm">
                  <p><strong>Rate Limit:</strong> {currentModelInfo?.rpm} reqs/min</p>
                  <p><strong>Daily Usage:</strong> {dailyCount} / {currentModelInfo?.dailyLimit}</p>
              </div>
          </div>
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-lg lg:max-w-2xl px-5 py-3 rounded-2xl break-words ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user' && (
              <div className="flex justify-start">
                   <div className="bg-muted rounded-2xl p-4">
                     <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                         <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:0.2s]"></div>
                         <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:0.4s]"></div>
                     </div>
                   </div>
              </div>
          )}
        </div>

        <div className="p-4 border-t">
          {error && <p className="text-destructive mb-2 text-center text-sm">{error}</p>}
          <div className="flex items-center space-x-4">
            <Input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && !isLoading && handleSendMessage()} placeholder="Type your message..." disabled={isLoading}/>
            <Button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()}>Send</Button>
          </div>
        </div>
      </div>
    </main>
  );
};

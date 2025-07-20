import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GenerateContentResponse {
  text: string;
  responseTime: number;
}

export class GoogleGenAIService {
  private ai: GoogleGenAI;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = "AIzaSyAT0Zs3D_bBf_jaxgc2ZpdjbFsI1auvpFA";
    if (!this.apiKey) {
      console.error("GEMINI API key is not configured. Please set the GEMINI environment variable.");
    }
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async generateContentStream(
    model: string,
    messages: ChatMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<GenerateContentResponse> {
    try {
      const config = {
        responseMimeType: "text/plain",
      };

      const contents = messages.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      }));

      const startTime = performance.now();
      const response = await this.ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      let fullResponse = "";

      for await (const chunk of response) {
        const chunkText = chunk.text || "";
        fullResponse += chunkText;
        
        if (onChunk) {
          onChunk(chunkText);
        }
      }

      const endTime = performance.now();
      const responseTime = (endTime - startTime) / 1000;

      return {
        text: fullResponse,
        responseTime
      };
    } catch (error) {
      console.error("Error generating content:", error);
      throw new Error("Failed to generate content");
    }
  }

  async generateContent(
    model: string,
    messages: ChatMessage[]
  ): Promise<GenerateContentResponse> {
    try {
      const config = {
        responseMimeType: "text/plain",
      };

      const contents = messages.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      }));

      const startTime = performance.now();
      const response = await this.ai.models.generateContent({
        model,
        config,
        contents,
      });

      const endTime = performance.now();
      const responseTime = (endTime - startTime) / 1000;

      return {
        text: response.text || "",
        responseTime
      };
    } catch (error) {
      console.error("Error generating content:", error);
      throw new Error("Failed to generate content");
    }
  }

  // Available models from Google AI Studio
  getAvailableModels() {
    return [
      "gemma-3n-e4b-it",
      "gemma-3-27b-it",
      "gemma-3-12b-it",
      "gemma-3-4b-it",
      "gemma-3-1b-it",
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash-preview-image-generation",
      "gemini-2.0-flash",
      "gemini-2.5-flash-preview-04-17",
      "gemini-2.5-pro-preview-05-06",
      "learnlm-2.0-flash-experimental",
      "models/gemini-2.0-flash-live-001",
      "models/gemini-2.5-flash-exp-native-audio-thinking-dialog",
      "models/gemini-2.5-flash-preview-native-audio-dialog",
      "models/imagen-3.0-generate-002",
      "veo-2.0-generate-001",
      "gemini-2.5-flash-preview-tts",
    ];
  }

  // Utility to format messages for the API
  formatMessagesForAPI(messages: Array<{ role: string; content: string }>): ChatMessage[] {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
  }
}

export const googleGenAIService = new GoogleGenAIService();

import { useAIModelStore } from "@/store/ai-model-store";
import type { Message } from "@/types/chat";

class AIService {
  // No constructor is needed. The service is now stateless.

  /**
   * Gets the current AI model directly from the Zustand store.
   * This is a getter, so you can access it like a property: `aiService.currentModel`
   */
  get currentModel(): string {
    return useAIModelStore.getState().currentModel;
  }

  /**
   * Updates the AI model in the central Zustand store.
   * @param model The new model ID to set.
   */
  setModel(model: string) {
    console.log("AIService delegating setModel to Zustand store:", model);
    // Call the action on the store to update the state globally.
    useAIModelStore.getState().setModel(model);
  }

  /**
   * Generates a complete response by consuming the entire stream.
   * @param messages The array of chat messages.
   * @returns A promise that resolves to the full response string.
   */
  async generateResponse(messages: Message[]): Promise<string> {
    let fullResponse = "";
    // The generateResponseStream method will use the `currentModel` getter.
    for await (const chunk of this.generateResponseStream(messages)) {
      fullResponse += chunk;
    }
    return fullResponse;
  }

  /**
   * Generates a response as an asynchronous stream of text chunks.
   * @param messages The array of chat messages.
   * @returns An async generator that yields response text chunks.
   */
  async *generateResponseStream(messages: Message[]): AsyncGenerator<string> {
    try {
      if (!Array.isArray(messages)) {
        console.error("aiService.generateResponseStream was called with a non-array value:", messages);
        throw new Error("The 'messages' argument must be an array.");
      }
      
      // This will now call the `currentModel` getter, which fetches from the Zustand store.
      const model = this.currentModel;
      console.log(`Generating response using model: ${model}`);

      // Format messages for the API according to the expected format
      // Extract the last message as the current message
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      
      if (!lastMessage) {
        throw new Error("No messages provided to generate a response");
      }
      
      // Create history from all but the last message if it's from the user
      // If last message is from assistant, use all messages as history
      const history = lastMessage.role === "user" 
        ? messages.slice(0, -1).map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          }))
        : messages.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          }));
      
      // Get the current message text
      const message = lastMessage.role === "user" ? lastMessage.content : "";

      // Determine if we're using "think" mode based on the model name
      const parentSubCategory = model.includes("learnlm") || model.includes("gemma-3-27b") ? "think" : "fast";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          history,
          message,
          mediaCategory: "text",
          parentSubCategory
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      // Using 'utf-8' explicitly and setting fatal to false to handle all characters
      const decoder = new TextDecoder('utf-8', { fatal: false });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode without any transformation
        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } catch (error) {
      console.error("Error in generateResponseStream:", error);
      // Re-throw the error so the caller can handle it.
      throw error;
    }
  }
}

/**
 * A singleton instance of the AIService.
 * Import this instance to use the service throughout the application.
 */
export const aiService = new AIService();

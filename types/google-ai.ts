// lib/types/google-ai.ts
export interface ComputeTokensParameters {
    model: string;
    contents: string | Array<{ text: string }>;
  }
  
  export interface ComputeTokensResponse {
    tokens: string[];
    tokenIds: number[];
  }
  
  export interface CountTokensParameters {
    model: string;
    contents: string | Array<{ text: string }>;
  }
  
  export interface CountTokensResponse {
    totalTokens: number;
  }
  
  export interface EmbedContentParameters {
    model: string;
    contents: string | string[];
    config?: {
      outputDimensionality?: number;
    };
  }
  
  export interface EmbedContentResponse {
    embeddings: number[][];
  }
  
  export interface GenerateContentParameters {
    model: string;
    contents: string | Array<{ role: string; parts: Array<{ text: string }> }>;
    config?: {
      candidateCount?: number;
      maxOutputTokens?: number;
      responseMimeType?: string;
      tools?: Array<{ googleSearch?: Record<string, any> }>;
      systemInstruction?: Array<{ text: string }>;
    };
  }
  
  export interface GenerateContentResponse {
    text: string;
    [key: string]: any;
  }
  
  export interface GenerateImagesParameters {
    model: string;
    prompt: string;
    config?: {
      numberOfImages?: number;
      includeRaiReason?: boolean;
    };
  }
  
  export interface GenerateImagesResponse {
    generatedImages?: Array<{
      image?: {
        imageBytes?: string;
      };
    }>;
  }
  
  export interface GenerateVideosParameters {
    model: string;
    prompt: string;
    config?: {
      numberOfVideos?: number;
    };
  }
  
  export interface GenerateVideosOperation {
    done: boolean;
    response?: {
      generatedVideos?: Array<{
        video?: {
          uri?: string;
        };
      }>;
    };
    [key: string]: any;
  }
  
  export interface GetModelParameters {
    model: string;
  }
  
  export interface Model {
    name: string;
    [key: string]: any;
  }
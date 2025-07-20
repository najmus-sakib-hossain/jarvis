import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createRef, RefObject } from 'react'

interface ComposerState {
  // Input content state
  value: string
  setValue: (value: string) => void
  
  // UI state
  inputHeight: number
  setInputHeight: (height: number) => void
  isMaxHeight: boolean
  setIsMaxHeight: (isMax: boolean) => void
  
  // Textarea ref
  textareaRef: RefObject<HTMLTextAreaElement>
  minHeight: number
  maxHeight: number
  adjustHeight: (reset?: boolean) => void
  
  // Media state
  imagePreview: string | null
  setImagePreview: (preview: string | null) => void
  
  // File and URL handling
  handleImageUpload: (file: File | null) => void
  handleUrlAnalysis: (urls: string[], prompt: string, type?: string) => void
  setHandleUrlAnalysis: (urlAnalysisFn: (urls: string[], prompt: string, type?: string) => void) => void
  handleAIGenerate: (prompt: string, messages?: any[]) => Promise<any>
  setHandleAIGenerate: (aiGenFn: (prompt: string, messages?: any[]) => Promise<any>) => void

  // Actions
  onSubmit: () => void
  setOnSubmit: (submitFn: () => void) => void
  onHeightChange: (reset?: boolean) => void
  setOnHeightChange: (heightChangeFn: (reset?: boolean) => void) => void

  // Image generation response handling
  handleImageGeneration: (response: any) => void
  setHandleImageGeneration: (genFn: (response: any) => void) => void
  
  // Text insertion handling
  handleInsertText: (text: string, type: string) => void
  setHandleInsertText: (insertFn: (text: string, type: string) => void) => void
}

export const useComposerStore = create<ComposerState>()(
  persist(
    (set, get) => ({
      // Input content state
      value: '',
      setValue: (value) => set({ value }),
      
      // UI state
      inputHeight: 48,
      setInputHeight: (height) => set({ inputHeight: height }),
      isMaxHeight: false,
      setIsMaxHeight: (isMax) => set({ isMaxHeight: isMax }),
      
      // Textarea ref with min/max height configuration
      textareaRef: createRef<any>(),
      minHeight: 48,
      maxHeight: 300,
      adjustHeight: (reset = false) => {
        const { textareaRef, minHeight, maxHeight, setInputHeight } = get();
        if (!textareaRef.current) return;
        
        if (reset) {
          textareaRef.current.style.height = `${minHeight}px`;
          setInputHeight(minHeight);
          return;
        }
        
        const scrollHeight = textareaRef.current.scrollHeight;
        const newHeight = Math.min(scrollHeight, maxHeight);
        textareaRef.current.style.height = `${newHeight}px`;
        setInputHeight(newHeight);
      },
      
      // Media state
      imagePreview: null,
      setImagePreview: (preview) => set({ imagePreview: preview }),
      
      // Functions that will be set by components
      onSubmit: () => {
        // console.log('Default onSubmit function called - this should be replaced');
        alert('Default submit function called - not connected properly');
      },
      
      setOnSubmit: (submitFn) => {
        // console.log('Setting submit function in store');
        if (typeof submitFn !== 'function') {
          console.error('Invalid submit function provided:', submitFn);
        } else {
          set({ onSubmit: submitFn });
        }
      },
      
      onHeightChange: (reset?: boolean) => {
        // Default implementation will be replaced
        // console.log('Height change function not set yet')
      },
      setOnHeightChange: (heightChangeFn) => set({ onHeightChange: heightChangeFn }),
      
      // File and URL handling
      handleImageUpload: (file) => {
        if (file) {
          set({ imagePreview: URL.createObjectURL(file) })
        } else {
          set({ imagePreview: null })
        }
      },
      
      handleUrlAnalysis: (urls, prompt, type = 'url_analysis') => {
        // Will be implemented by the page component
        // console.log('URL analysis function not set yet', { urls, prompt, type })
      },
      setHandleUrlAnalysis: (urlAnalysisFn) => set({ handleUrlAnalysis: urlAnalysisFn }),
      
      handleAIGenerate: async (prompt, messages = []) => {
        // Will be implemented by the page component
        // console.log('AI generate function not set yet', { prompt, messages })
        return null
      },
      setHandleAIGenerate: (aiGenFn) => set({ handleAIGenerate: aiGenFn }),
      
      // Image generation response handling
      handleImageGeneration: (response) => {
        // Will be implemented by the page component
        // console.log('Image generation handler not set yet', response)
      },
      setHandleImageGeneration: (genFn) => set({ handleImageGeneration: genFn }),
      
      // Text insertion handling
      handleInsertText: (text, type) => {
        // Will be updated by the page component
        // console.log('Text insertion handler not set yet', { text, type })
        set({ value: text })
      },
      setHandleInsertText: (insertFn) => set({ handleInsertText: insertFn }),
    }),
    {
      name: 'friday-composer-storage',
      partialize: (state) => ({
        // Only persist these values
        inputHeight: state.inputHeight,
        isMaxHeight: state.isMaxHeight,
        // Don't persist functions
      }),
    }
  )
)

// Define this default function to check if onSubmit has been properly set
const onSubmitDefault = () => {
  // console.log('Default submit function called');
};

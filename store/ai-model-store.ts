import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

// This is a dummy storage object that does nothing.
// It's used on the server where `localStorage` is not available.
const dummyStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// This custom storage object safely uses localStorage on the client
// and falls back to the dummy storage on the server.
const ssrSafeStorage: StateStorage = {
  getItem: (name) => {
    // Check if we are in a browser environment
    const isBrowser = typeof window !== 'undefined';
    return isBrowser ? localStorage.getItem(name) : null;
  },
  setItem: (name, value) => {
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name) => {
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
      localStorage.removeItem(name);
    }
  },
};


interface AIModelState {
  currentModel: string;
  setModel: (model: string) => void;
  lastUpdated: string;
  isSwitching: boolean;
  setIsSwitching: (isSwitching: boolean) => void;
  forceSetModel: (model: string) => void;
}

export const useAIModelStore = create<AIModelState>()(
  persist(
    (set, get) => ({
      // 1. Set a default initial state without accessing localStorage.
      // The `persist` middleware will automatically "rehydrate" this
      // state with the value from localStorage on the client-side.
      currentModel: 'gemma-3-27b-it',
      lastUpdated: new Date().toISOString(),
      isSwitching: false,

      setModel: (model: string) => {
        // Validate model before setting
        if (!model || typeof model !== 'string' || !isValidModel(model)) {
          console.error('Invalid model format or value:', model);
          return;
        }

        // Only update if model has actually changed
        if (model !== get().currentModel) {
          // 2. Just use `set`. The persist middleware handles saving to localStorage.
          // No need for manual `localStorage.setItem` calls.
          set({
            currentModel: model,
            lastUpdated: new Date().toISOString(),
          });
          console.log('Model updated in store to:', model);
        }
      },

      setIsSwitching: (isSwitching: boolean) => {
        set({ isSwitching });
      },

      // Force set model with no conditions
      forceSetModel: (model: string) => {
        console.log('FORCE setting model in store:', model);
        // 3. Just use `set` here as well.
        set({
          currentModel: model,
          lastUpdated: new Date().toISOString(),
        });
      },
    }),
    {
      name: 'ai-model-storage', // The key in localStorage.
      // 4. Use the SSR-safe storage.
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : dummyStorage
      ),
      // Only persist these specific fields.
      partialize: (state) => ({
        currentModel: state.currentModel,
        lastUpdated: state.lastUpdated,
      }),
      // 5. Removed the complex `onRehydrateStorage` logic.
      // The middleware handles rehydration automatically and safely.
    }
  )
);

// Add a utility function to check if model is valid
export const isValidModel = (model: string): boolean => {
  const validModels = [
    "learnlm-2.0-flash-experimental",
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
    "gemma-3n-e4b-it"
  ];
  return validModels.includes(model);
};

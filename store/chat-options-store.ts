import { create } from "zustand";
import {
    Type,
    Image,
    AudioWaveform,
    Video,
    Brush,
    Search,
    Code,
    Globe,
    Smartphone,
    Laptop,
    Terminal,
    LucideProps,
    Wand,
    Crop,
    Music,
    MicVocal,
    GalleryVerticalEnd,
    Sparkles,
    Gem,
    AudioLines,
    Webcam,
    Blocks,
    Chrome,
    Podcast,
    BoomBox,
    Speaker,
    Hourglass,
    Microscope,
    TrainFront,
    FastForward,
    ClockFading,
    Clapperboard,
} from "lucide-react";

export interface CategoryItem {
    label: string;
    icon: React.ComponentType<LucideProps>;
}

export interface ChildSubcategoryItem extends CategoryItem {
    id: string;
}

// All option configurations are now defined here
export const mediaCategories: Record<string, CategoryItem> = {
    text: { label: "Text", icon: Type },
    image: { label: "Image", icon: Image },
    audio: { label: "Audio", icon: AudioWaveform },
    video: { label: "Video", icon: Video },
};

export const parentSubcategories: Record<string, CategoryItem> = {
    "text-default": { label: "Default", icon: Sparkles },
    canvas: { label: "Canvas", icon: Brush },
    search: { label: "Search", icon: Search },
    "deep-research": { label: "Deep Research", icon: Microscope },
    code: { label: "Code", icon: Code },
    "image-fast": { label: "Image Fast", icon: ClockFading },
    "image-quality": { label: "Image Quality", icon: Gem },
    "video-fast": { label: "Video Fast", icon: FastForward },
    "video-quality": { label: "Video Quality", icon: Clapperboard },
    translation: { label: "Translation", icon: AudioLines },
    music: { label: "Music", icon: Music },
};

export const childSubcategories: Record<string, ChildSubcategoryItem[]> = {
    "text-default": [
        { id: "fast", label: "Fast", icon: TrainFront },
        { id: "think", label: "Think", icon: Hourglass },
    ],
    code: [
        { id: "web", label: "Web", icon: Globe },
        { id: "mobile", label: "Mobile Apps", icon: Smartphone },
        { id: "desktop", label: "Desktop Apps", icon: Laptop },
        { id: "pwa", label: "Progressive Web Apps", icon: Webcam },
        { id: "browser-extension", label: "Browser Extension", icon: Chrome },
        { id: "other-extension", label: "Other Extension", icon: Blocks },
        { id: "cli", label: "CLI/Terminal Apps", icon: Terminal },
    ],
    "image-fast": [
        { id: "1:1", label: "1:1", icon: Crop },
        { id: "9:16", label: "9:16", icon: Crop },
        { id: "16:9", label: "16:9", icon: Crop },
        { id: "3:4", label: "3:4", icon: Crop },
        { id: "4:3", label: "4:3", icon: Crop },
    ],
    "image-quality": [
        { id: "1:1", label: "1:1", icon: Crop },
        { id: "9:16", label: "9:16", icon: Crop },
        { id: "16:9", label: "16:9", icon: Crop },
        { id: "3:4", label: "3:4", icon: Crop },
        { id: "4:3", label: "4:3", icon: Crop },
    ],
    "video-fast": [
        { id: "1:1-8s", label: "1:1 (8s)", icon: Crop },
        { id: "9:16-8s", label: "9:16 (8s)", icon: Crop },
        { id: "16:9-8s", label: "16:9 (8s)", icon: Crop },
    ],
    "video-quality": [
        { id: "9:16-30s", label: "9:16 (30s)", icon: Crop },
        { id: "16:9-30s", label: "16:9 (30s)", icon: Crop },
    ],
    translation: [
        { id: "tts", label: "TTS", icon: GalleryVerticalEnd },
        { id: "podcast", label: "Podcast", icon: Podcast },
    ],
    music: [
        { id: "background", label: "Background", icon: BoomBox },
        { id: "sfx", label: "Sound Effect", icon: Speaker },
        { id: "voiceover", label: "Voiceover", icon: MicVocal },
    ],
};

export type MediaCategoryKey = keyof typeof mediaCategories;
export type ParentSubcategoryKey = keyof typeof parentSubcategories;
export type ChildSubcategoryKey = string;

// Helper functions are also defined in the store
export const getDefaultParent = (mediaKey: MediaCategoryKey): ParentSubcategoryKey => {
    switch (mediaKey) {
        case "text": return "text-default";
        case "image": return "image-fast";
        case "video": return "video-fast";
        case "audio": return "translation"; // Updated default
        default: return "text-default";
    }
};

export const getDefaultChild = (mediaKey: MediaCategoryKey, parentKey: ParentSubcategoryKey): ChildSubcategoryKey | null => {
    switch (parentKey) {
        case "text-default": return "fast";
        case "image-fast":
        case "image-quality": return "16:9";
        case "video-fast": return "16:9-8s";
        case "video-quality": return "16:9-30s";
        case "translation": return "tts"; // Added case
        case "music": return "background"; // Added case
        case "code": return "web";
        default: return null;
    }
};

interface ChatOptionsState {
    selectedMedia: MediaCategoryKey;
    selectedParent: ParentSubcategoryKey;
    selectedChild: ChildSubcategoryKey | null;
    setSelectedMedia: (mediaKey: MediaCategoryKey) => void;
    setSelectedParent: (parentKey: ParentSubcategoryKey) => void;
    setSelectedChild: (childId: ChildSubcategoryKey | null) => void;
}

export const useChatOptionsStore = create<ChatOptionsState>()((set, get) => ({
    selectedMedia: "text",
    selectedParent: getDefaultParent("text"),
    selectedChild: getDefaultChild("text", getDefaultParent("text")),

    setSelectedMedia: (mediaKey) => {
        const defaultParent = getDefaultParent(mediaKey);
        const defaultChild = getDefaultChild(mediaKey, defaultParent);
        set({
            selectedMedia: mediaKey,
            selectedParent: defaultParent,
            selectedChild: defaultChild,
        });
    },

    setSelectedParent: (parentKey) => {
        set({
            selectedParent: parentKey,
            selectedChild: getDefaultChild(get().selectedMedia, parentKey),
        });
    },

    setSelectedChild: (childId) => set({ selectedChild: childId }),
}));
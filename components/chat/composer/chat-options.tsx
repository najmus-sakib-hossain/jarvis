"use client";
import React, { useMemo, FC, useEffect } from 'react';
import { LucideProps, Wand } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAIModelStore } from '@/store/ai-model-store';
import { useChatInputStore } from '@/store/chat-store';
import {
  useChatOptionsStore,
  mediaCategories,
  parentSubcategories,
  childSubcategories,
  MediaCategoryKey,
  ParentSubcategoryKey,
  ChildSubcategoryKey,
  ChildSubcategoryItem,
} from '@/store/chat-options-store';

const VerticalSeparator: FC = () => (
  <div className="h-4 w-px bg-border mx-1" />
);

export const ChatOptions: FC = () => {
  const {
    selectedMedia,
    selectedParent,
    selectedChild,
    setSelectedMedia,
    setSelectedParent,
    setSelectedChild,
  } = useChatOptionsStore();

  const { setModel } = useAIModelStore();
  const { setChatState } = useChatInputStore();

  const parentOptions = useMemo((): ParentSubcategoryKey[] => {
    const common: ParentSubcategoryKey[] = ['canvas', 'search', 'deep-research'];
    switch (selectedMedia) {
      case 'text': return ['text-default', 'code', ...common];
      case 'image': return ['image-fast', 'image-quality', ...common];
      case 'video': return ['video-fast', 'video-quality', ...common];
      case 'audio': return ['translation', 'music', ...common];
      default: return common;
    }
  }, [selectedMedia]);

  const childOptions = useMemo((): ChildSubcategoryItem[] => {
    return selectedParent ? childSubcategories[selectedParent] || [] : [];
  }, [selectedParent]);

  useEffect(() => {
    const mediaConfig: any = { type: selectedMedia };

    switch (selectedMedia) {
      case 'text':
        if (selectedParent === 'text-default') {
          const model = selectedChild === 'think' ? 'learnlm-2.0-flash-experimental' : 'gemma-3-27b-it';
          setModel(model);
          mediaConfig.model = model;
        } else if (selectedParent === 'code') {
          setModel('gemma-3-27b-it');
          mediaConfig.model = 'gemma-3-27b-it';
        }
        break;

      case 'image':
        mediaConfig.model = selectedParent === 'image-quality' ? 'imagen-4.0-ultra-generate-preview-06-06' : 'imagen-4.0-fast-generate-preview-06-06';
        mediaConfig.aspectRatio = selectedChild;
        break;

      case 'video':
        mediaConfig.model = selectedParent === 'video-quality' ? 'veo-2.0-generate-001' : 'veo-2.0-fast-generate-001';
        if (selectedChild) {
          const [aspectRatio, duration] = selectedChild.split('-');
          mediaConfig.aspectRatio = aspectRatio;
          mediaConfig.duration = duration?.replace('s', '') || '8';
        }
        break;

      case 'audio':
        mediaConfig.endpoint = 'https://friday-images.vercel.app/api/generate-music';
        break;
    }

    setChatState(state => ({
      ...state,
      currentMediaType: selectedMedia as 'text' | 'image' | 'audio' | 'video',
      mediaConfig: { ...state.mediaConfig, ...mediaConfig },
    }));
  }, [selectedMedia, selectedParent, selectedChild, setChatState, setModel]);

  const handleMediaSelect = (mediaKey: MediaCategoryKey) => {
    setSelectedMedia(mediaKey);
    // toast.info(`Switched to ${mediaCategories[mediaKey].label} generation.`);
  };

  const handleParentSelect = (parentKey: ParentSubcategoryKey) => {
    setSelectedParent(parentKey);
    // toast.info(`Mode set to: ${parentSubcategories[parentKey].label}`);
  };

  const getTriggerDisplay = (type: 'media' | 'parent' | 'child', selectedKey: string | null) => {
    if (type === 'child') {
      const childData = selectedKey ? childOptions.find(c => c.id === selectedKey) : undefined;
      const Icon = childData?.icon || Wand;
      const label = childData?.label || "Default";
      const showIcon = selectedMedia === 'text' && selectedParent === 'text-default';

      return (
        <div className="flex items-center justify-center w-full">
          {showIcon ? <Icon className="size-3.5 text-muted-foreground group-hover:text-foreground" />
            : <span className="truncate w-min md:w-auto">{label}</span>}
        </div>
      );
    }

    const data = type === 'media'
      ? mediaCategories[selectedKey as MediaCategoryKey]
      : parentSubcategories[selectedKey as ParentSubcategoryKey];
    const Icon = data?.icon;

    return (
      <div className="flex items-center">
        {Icon ? <Icon className="size-3.5 text-muted-foreground group-hover:text-foreground" /> : "Select"}
      </div>
    );
  };

  return (
    <div className="flex items-center h-9 rounded-md border bg-card text-card-foreground p-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="group flex bg-card rounded-md border justify-center text-muted hover:text-foreground size-6.5 hover:bg-secondary">
            {getTriggerDisplay('media', selectedMedia)}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {Object.entries(mediaCategories).map(([key, { label, icon: Icon }]) => (
            <DropdownMenuItem key={key} onSelect={() => handleMediaSelect(key as MediaCategoryKey)}>
              <Icon className="mr-2 size-3.5" />
              <span className="text-xs">{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <VerticalSeparator />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="group flex bg-card rounded-md border justify-center text-muted hover:text-foreground size-6.5 hover:bg-secondary px-1.5" disabled={parentOptions.length === 0}>
            {getTriggerDisplay('parent', selectedParent)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {parentOptions.map((key) => {
            const { label, icon: Icon } = parentSubcategories[key];
            return (
              <DropdownMenuItem key={key} onSelect={() => handleParentSelect(key)}>
                <Icon className="mr-2 size-3.5" />
                <span className="text-xs">{label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {childOptions.length > 0 && (
        <>
          <VerticalSeparator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="group flex bg-card rounded-md border justify-center text-foreground h-6.5 min-w-6.5 hover:bg-secondary text-xs px-1.5" disabled={childOptions.length === 0}>
                {getTriggerDisplay('child', selectedChild)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {childOptions.map(({ id, label, icon: Icon }) => (
                <DropdownMenuItem key={id} onSelect={() => setSelectedChild(id)}>
                  <Icon className="mr-2 size-3.5" />
                  <span className="text-xs">{label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
};
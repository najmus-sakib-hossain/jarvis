"use client"

import React from "react"
import { MoonIcon, SunIcon, ChevronDownIcon } from "lucide-react"
import { useTheme } from "next-themes"
import {
  AnimationStart,
  AnimationVariant,
  createAnimation,
} from "@/lib/theme/theme-animations"
import { cn } from "@/lib/utils"
import {
  AllPresetsControl,
  ControlSection,
  ControlsSkeleton,
  RadiusSliderControl,
  ShadowsControl,
  SurfaceShadesControl,
} from "@/components/customizer/customizer-controls"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ThemeToggleAnimationProps {
  variant?: AnimationVariant
  start?: AnimationStart
  showLabel?: boolean
  className?: string
  url?: string
}

export default function ThemeToggleButton({
  variant = "circle-blur",
  start = "top-left",
  showLabel = false,
  className = "",
  url = "",
}: ThemeToggleAnimationProps) {
  const { theme, setTheme } = useTheme()

  const styleId = "theme-transition-styles"

  const updateStyles = React.useCallback((css: string, name: string) => {
    if (typeof window === "undefined") return

    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    console.log("style ELement", styleElement)
    console.log("name", name)

    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = css

    console.log("content updated")
  }, [])

  const toggleTheme = React.useCallback(() => {
    const animation = createAnimation(variant, start, url)

    updateStyles(animation.css, animation.name)

    if (typeof window === "undefined") return

    const switchTheme = () => {
      setTheme(theme === "light" ? "dark" : "light")
    }

    if (!document.startViewTransition) {
      switchTheme()
      return
    }

    document.startViewTransition(switchTheme)
  }, [theme, setTheme, start, updateStyles, variant, url])

  return (
    <div className="flex items-center justify-center space-x-2 border h-10 p-2 rounded-md hover:bg-accent">
      <button
        onClick={toggleTheme}
        className={cn(
          "hover:text-primary text-muted-foreground group relative flex items-center justify-center rounded-md transition-colors h-full",
          className
        )}
        aria-label="Toggle theme"
      >
        <SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </button>
      <AllPresetsControl />
    </div>
  )
}


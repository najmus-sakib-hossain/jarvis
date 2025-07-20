"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { startOfWeek, addDays, isSameDay } from "date-fns"
import {
  Orb,
  oceanDepthsPreset,
  galaxyPreset,
  caribeanPreset,
  cherryBlossomPreset,
  emeraldPreset,
  multiColorPreset,
  goldenGlowPreset,
  volcanicPreset
} from "@/components/orb/index"
import { cn } from "@/lib/utils"

interface FridayProps {
  className?: string
  orbSize?: number
  shapeSize?: number
  dragEnabled?: boolean
}

export default function Friday({
  className,
  orbSize = 25,
  shapeSize = 21,
  dragEnabled = true
}: FridayProps) {
  const [currentPreset, setCurrentPreset] = React.useState(multiColorPreset)

  // Array of all presets
  const presets = [
    multiColorPreset,
    oceanDepthsPreset,
    galaxyPreset,
    caribeanPreset,
    cherryBlossomPreset,
    emeraldPreset,
    goldenGlowPreset,
    volcanicPreset
  ]

  const updatePreset = (newPreset: any) => {
    setCurrentPreset(newPreset)
    // onPresetChange?.(newPreset)
  }

  // Get preset based on day of week
  const getPresetForDate = (date: Date) => {
    const weekStart = startOfWeek(date)
    const dayIndex = presets.length - 1

    for (let i = 0; i < presets.length; i++) {
      const currentDay = addDays(weekStart, i)
      if (isSameDay(date, currentDay)) {
        return presets[i]
      }
    }

    return presets[dayIndex]
  }

  // Handle drag end to change preset
  const handleDragEnd = (event: any, info: any) => {
    const { offset } = info
    const date = new Date()

    // Change preset based on drag direction
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Horizontal drag
      const newIndex = offset.x > 0 ?
        (presets.indexOf(currentPreset) + 1) % presets.length :
        (presets.indexOf(currentPreset) - 1 + presets.length) % presets.length
      updatePreset(presets[newIndex])
    } else {
      // Vertical drag - use date-based preset
      updatePreset(getPresetForDate(date))
    }
  }

  return (
    <motion.div
      className={cn(
        "text-sidebar-primary-foreground flex aspect-square min-h-8 min-w-8 items-center justify-center rounded-lg",
        dragEnabled && "cursor-pointer",
        className
      )}
      drag={dragEnabled}
      dragElastic={0.05}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      dragMomentum={false}
      whileDrag={{ scale: 1.05 }}
      whileTap={{ scale: 1.2 }}
      onClick={() => {
        if (!dragEnabled) return
        const nextIndex = (presets.indexOf(currentPreset) + 1) % presets.length
        updatePreset(presets[nextIndex])
      }}
      onDragEnd={handleDragEnd}
      transition={{
        type: "spring",
        stiffness: 2000,
        damping: 50,
        mass: 0.2,
        restDelta: 0.0001,
        restSpeed: 0.001
      }}
    >
      <Orb 
        className={cn(className)}
        baseOrbSize={orbSize}
        baseShapeSize={shapeSize}
        {...currentPreset}
      />
    </motion.div>
  )
}

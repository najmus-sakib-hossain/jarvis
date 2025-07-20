"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface NotificationProps {
  title?: string
  message: string
}

export function Banner({ title, message }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <div className="max-w-xs w-full rounded-md shadow-lg border">
      <div className="p-4">
        <div className="flex justify-between items-start">
          {title && <div className="text-sm">{title}</div>}
          <button onClick={() => setIsVisible(false)} className="hover:text-primary transition-colors">
            <X size={16} />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="mt-1 text-sm">{message}</div>
      </div>
    </div>
  )
}

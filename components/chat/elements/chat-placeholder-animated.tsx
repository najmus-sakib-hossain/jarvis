import { AnimatePresence, motion } from "framer-motion"

interface AnimatedPlaceholderProps {
  showSearch: boolean
  showResearch: boolean
  showThinking: boolean
}

export function AnimatedPlaceholder({ 
  showSearch, 
  showResearch, 
  showThinking 
}: AnimatedPlaceholderProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={showSearch ? "search" : showResearch ? "research" : showThinking ? "thinking" : "ask"}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.1 }}
        className="text-muted-foreground pointer-events-none absolute w-[150px] text-sm"
      >
        {showSearch
          ? "Search the web..."
          : showResearch
            ? "Show Research..."
            : showThinking
              ? "Show Thinking..."
              : "Ask Ai..."}
      </motion.p>
    </AnimatePresence>
  )
}

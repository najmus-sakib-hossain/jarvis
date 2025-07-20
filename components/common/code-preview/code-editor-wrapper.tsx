"use client"

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Code } from 'lucide-react'

// Dynamically import the CodeEditor component with SSR disabled
const CodeEditorComponent = dynamic(
  () => import('@/components/common/code-preview/code-preview').then(mod => ({ default: mod.CodeEditor })),
  { ssr: false }
)

export function CodeEditorWrapper() {
  return (
    <div suppressHydrationWarning>
      <Suspense fallback={
        <div className="bg-background text-foreground flex h-screen flex-col">
          <div className="border-border flex items-center justify-between border-b p-2">
            <div className="flex items-center gap-2">
              <Code className="text-primary size-5" />
              <h1 className="text-sm font-medium">Code Editor</h1>
            </div>
          </div>
          <div className="grid flex-1 place-items-center">
            <div className="text-muted-foreground">Loading editor...</div>
          </div>
        </div>
      }>
        <CodeEditorComponent />
      </Suspense>
    </div>
  )
}

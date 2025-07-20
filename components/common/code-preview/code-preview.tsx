"use client"

import { useState, useRef, useEffect, Suspense, useCallback, Component, ErrorInfo } from 'react'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import {
  Terminal, Code, RefreshCw,
  Copy, Download, FileText, Folder,
  FolderOpen, ArrowLeft, ArrowRight, ChevronDown, ChevronUp,
  PanelLeft, PanelLeftOpen, PanelLeftClose // Added sidebar toggle icons
} from 'lucide-react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

// Add a proper error boundary
class ErrorBoundary extends Component<
  { children: React.ReactNode, fallback: React.ReactNode },
  { hasError: boolean, error: Error | null }
> {
  constructor(props: { children: React.ReactNode, fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by error boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Create a ClientOnly wrapper component
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
    return () => {
      // Cleanup any potential memory leaks here if needed
    };
  }, []);
  
  if (!hasMounted) {
    return null;
  }
  
  return <>{children}</>;
}

// Use dynamic imports for client-side only components with no SSR
const Editor = dynamic(() => import('@monaco-editor/react').catch(err => {
  console.error("Failed to load Monaco Editor:", err);
  return () => <div className="h-full grid place-items-center">
    <div className="text-center">
      <p className="text-red-500 mb-2">Editor failed to load.</p>
      <p className="text-muted-foreground text-sm">Please try refreshing the page.</p>
    </div>
  </div>;
}), {
  ssr: false,
  loading: () => <div className="h-full grid place-items-center"><p className="text-muted-foreground">Loading editor...</p></div>,
})

const SplitPane = dynamic(() => import('react-split')
  .then(mod => mod)
  .catch(err => {
    console.error("Failed to load Split Pane:", err);
    // Return a component that accepts the same props as react-split
    return {
      default: (props: any) => <div className="flex flex-col h-full">{props.children}</div>
    };
  }), {
  ssr: false,
  loading: () => <div className="h-full grid place-items-center"><p className="text-muted-foreground">Loading panels...</p></div>,
})

// Dummy file structure for sidebar
const files = [
  {
    name: "src",
    type: "folder",
    expanded: true,
    children: [
      {
        name: "components",
        type: "folder",
        expanded: true,
        children: [
          { name: "Button.tsx", type: "file", language: "typescript" },
          { name: "Card.tsx", type: "file", language: "typescript" },
          { name: "Input.tsx", type: "file", language: "typescript" },
        ]
      },
      {
        name: "pages",
        type: "folder",
        expanded: false,
        children: [
          { name: "index.tsx", type: "file", language: "typescript" },
          { name: "about.tsx", type: "file", language: "typescript" },
        ]
      },
      { name: "App.tsx", type: "file", language: "typescript" },
      { name: "index.css", type: "file", language: "css" },
    ]
  },
  { name: "package.json", type: "file", language: "json" },
  { name: "tsconfig.json", type: "file", language: "json" },
]

// Create a debounce utility function
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return function(...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

// Client-only component to wrap monaco editor
function MonacoEditorClient({
  currentTheme,
  defaultCode,
  onMount,
  editorContainerRef
}: {
  currentTheme: string;
  defaultCode: string;
  onMount: (editor: any, monaco: any) => void;
  editorContainerRef: React.RefObject<HTMLDivElement | null>; // Allow null
}) {
  const [editorError, setEditorError] = useState<Error | null>(null);
  
  const handleEditorWillMount = useCallback((monaco: any) => {
    try {
      // Define both light and dark themes with default syntax highlighting
      monaco.editor.defineTheme('shadcn-light', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#ffffff',
          'editor.foreground': '#020617',
          'editorCursor.foreground': '#171717',
          'editor.lineHighlightBackground': '#f5f5f5',
          'editorLineNumber.foreground': '#737373',
          'editorLineNumber.activeForeground': '#171717',
          'editor.selectionBackground': '#f5f5f580',
          'editor.selectionForeground': '#171717',
          'editor.inactiveSelectionBackground': '#f5f5f5',
          'editorWidget.background': '#ffffff',
          'editorWidget.border': '#e5e5e5',
          'editorSuggestWidget.background': '#ffffff',
          'editorSuggestWidget.border': '#e5e5e5',
          'editorSuggestWidget.foreground': '#020617',
          'editorSuggestWidget.highlightForeground': '#171717',
          'editorSuggestWidget.selectedBackground': '#f5f5f5',
        }
      });
      monaco.editor.defineTheme('shadcn-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#09090b',
          'editor.foreground': '#fafafa',
          'editorCursor.foreground': '#fafafa',
          'editor.lineHighlightBackground': '#27272a',
          'editorLineNumber.foreground': '#a1a1aa',
          'editorLineNumber.activeForeground': '#fafafa',
          'editor.selectionBackground': '#27272a80',
          'editor.selectionForeground': '#fafafa',
          'editor.inactiveSelectionBackground': '#27272a',
          'editorWidget.background': '#0a0a0a',
          'editorWidget.border': '#27272a',
          'editorSuggestWidget.background': '#0a0a0a',
          'editorSuggestWidget.border': '#27272a',
          'editorSuggestWidget.foreground': '#fafafa',
          'editorSuggestWidget.highlightForeground': '#fafafa',
          'editorSuggestWidget.selectedBackground': '#27272a',
        }
      });
    } catch (error) {
      console.error("Error in beforeMount:", error);
      setEditorError(error instanceof Error ? error : new Error(String(error)));
    }
  }, []);
  
  if (editorError) {
    return (
      <div className="h-full p-4 overflow-auto">
        <h3 className="text-red-500 font-medium">Editor Error</h3>
        <p className="mt-2 text-sm">{editorError.message}</p>
      </div>
    );
  }
  
  return (
    <div ref={editorContainerRef} className="h-full" style={{ position: 'relative' }}>
      <Editor
        height="100%"
        defaultLanguage="typescript"
        value={defaultCode}
        theme={currentTheme === 'light' ? 'shadcn-light' : 'shadcn-dark'}
        options={{
          minimap: { enabled: false },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "all",
          contextmenu: true,
          guides: {
            indentation: true,
          },
          fixedOverflowWidgets: true,
        }}
        beforeMount={handleEditorWillMount}
        onMount={onMount}
        loading={<div className="h-full grid place-items-center text-muted-foreground bg-background rounded-none">Loading editor...</div>}
      />
    </div>
  );
}

// The main component
export function CodeEditor() {
  const { resolvedTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<string>("dark") 
  const [monacoInstance, setMonacoInstance] = useState<any>(null)
  const [editorInstance, setEditorInstance] = useState<any>(null)
  const [activeFile, setActiveFile] = useState<string>("App.tsx")
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()
  const [consoleExpanded, setConsoleExpanded] = useState(false)
  const [editorError, setEditorError] = useState<Error | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for local sidebar

  const defaultCode = `const cuisines = [
  "Mexican",
  "Italian",
  "Chinese",
]

const transitionProps = {}`

  // Safely handle body attributes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !mountedRef.current) {
        const bodyAttributes = document.body.getAttributeNames()
          .filter(attr => attr.startsWith('data-') || attr === 'cz-shortcut-listen');
        
        bodyAttributes.forEach(attr => {
          document.body.setAttribute(`data-preserve-${attr}`, document.body.getAttribute(attr) || '');
        });
        
        setIsClient(true);
        mountedRef.current = true;
      }
    } catch (e) {
      console.error("Error handling body attributes:", e);
    }
  }, []);

  // Safe theme and UI initialization
  useEffect(() => {
    if (!isClient) return;
    
    // Safe theme update
    try {
      setCurrentTheme(resolvedTheme === 'light' ? 'light' : 'dark');
    } catch (e) {
      console.error("Error setting theme:", e);
    }
  }, [resolvedTheme, isClient]);

  // Safe editor mount handler with proper error handling
  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    try {
      if (!mountedRef.current) return;
      
      setEditorInstance(editor);
      setMonacoInstance(monaco);
      
      const timer = setTimeout(() => {
        try {
          editor.layout();
        } catch (error) {
          console.error("Error in initial editor layout:", error);
        }
      }, 50);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error during editor mount:", error);
      setEditorError(error instanceof Error ? error : new Error(String(error)));
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const errorHandler = (event: ErrorEvent) => {
      if (
        event.message &&
        (event.message.includes('ResizeObserver') || 
         event.message.includes('ResizeObserver loop completed with undelivered notifications'))
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !editorInstance) return;
    
    const handleResize = debounce(() => {
      if (editorInstance) {
        try {
          editorInstance.layout();
        } catch (error) {
          console.error("Error updating editor layout:", error);
        }
      }
    }, 100);

    window.addEventListener('resize', handleResize);
    
    setTimeout(() => {
      handleResize();
    }, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isClient, editorInstance]);

  // Update editor layout when sidebar state changes (refined)
  useEffect(() => {
    if (!isClient || !editorInstance || !editorContainerRef.current) {
      // console.log("Sidebar toggle effect: Skipping due to missing refs/instance/client state.");
      return;
    }

    // Check if editor instance is valid and has layout method
    if (!editorInstance || typeof editorInstance.layout !== 'function') {
      console.warn("Sidebar toggle effect: Editor instance or layout method not available, skipping layout.");
      return;
    }

    // Delay layout update slightly longer to ensure CSS transition completes
    const transitionDuration = 300; // Increased delay (adjust if needed)
    console.log(`Sidebar toggle effect: Scheduling editor layout update in ${transitionDuration}ms.`);

    const timer = setTimeout(() => {
      // Re-check refs and instance before calling layout inside timeout
      if (editorInstance && editorContainerRef.current && typeof editorInstance.layout === 'function') {
        try {
          console.log("Sidebar toggle effect: Attempting editor layout...");
          editorInstance.layout();
          console.log("Sidebar toggle effect: Editor layout successful.");
        } catch (error) {
          console.error("Sidebar toggle effect: Error updating layout (inside timeout):", error);
          // Optionally set an error state to inform the user
          // setEditorError(new Error(`Failed to resize editor: ${error.message}`));
        }
      } else {
        console.warn("Sidebar toggle effect: Editor instance or container became unavailable before layout call in timeout.");
      }
    }, transitionDuration);

    return () => {
      console.log("Sidebar toggle effect: Clearing layout timeout.");
      clearTimeout(timer);
    };
  }, [isSidebarOpen, editorInstance, isClient, editorContainerRef]); // Keep dependencies

  const handleCopyCode = () => {
    if (!editorInstance) return;
    
    try {
      const code = editorInstance.getValue();
      navigator.clipboard.writeText(code)
        .then(() => {
          toast({
            title: "Code copied to clipboard",
            description: `Successfully copied code from ${activeFile}`,
            action: (
              <ToastAction altText="Dismiss">Dismiss</ToastAction>
            ),
          });
        })
        .catch(err => {
          console.error('Failed to copy code:', err);
          toast({
            variant: "destructive",
            title: "Failed to copy",
            description: "There was an error copying to clipboard",
          });
        });
    } catch (error) {
      console.error("Error while copying code:", error);
    }
  }

  const handleDownloadCode = () => {
    if (editorInstance) {
      const code = editorInstance.getValue();
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile || "code.tsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "File downloaded",
        description: `Successfully saved ${activeFile || "code.tsx"}`,
        action: (
          <ToastAction altText="Dismiss">Dismiss</ToastAction>
        ),
      });
    }
  }

  useEffect(() => {
    if (!isClient || !monacoInstance || !editorInstance) return;
    
    try {
      const themeToUse = resolvedTheme === 'light' ? 'shadcn-light' : 'shadcn-dark';
      editorInstance.updateOptions({ theme: themeToUse });
    } catch (err) {
      console.error("Failed to update editor theme:", err);
    }
  }, [resolvedTheme, monacoInstance, editorInstance, isClient]);

  const toggleConsole = () => {
    setConsoleExpanded(prev => !prev);
    
    // Ensure console is visible after expanding
    if (!consoleExpanded) {
      setTimeout(() => {
        const consoleElement = document.querySelector('.console-container');
        if (consoleElement) {
          consoleElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        
        // Force editor layout update after console expansion
        if (editorInstance) {
          try {
            editorInstance.layout();
          } catch (error) {
            console.error("Error updating editor layout after console toggle:", error);
          }
        }
      }, 50);
    }
  }

  const handleConsoleResize = (sizes: number[]) => {
    if (!isClient || !editorInstance) return;
    
    setTimeout(() => {
      try {
        editorInstance.layout();
      } catch (error) {
        console.error("Error updating editor layout after resize:", error);
      }
    }, 10);
  };

  const toggleLocalSidebar = () => {
    // Removed try...catch to allow errors to surface if they originate here
    console.log("Toggling local sidebar state...");
    setIsSidebarOpen(prev => !prev);
  };

  // Safe render for server
  if (!isClient) {
    return (
      <div className="text-foreground flex h-full flex-col bg-background rounded-none" suppressHydrationWarning>
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
    );
  }

  if (editorError) {
    return (
      <div className="bg-background text-foreground flex h-full flex-col rounded-full p-4">
        <h2 className="text-lg font-semibold text-red-500">Editor Error</h2>
        <p className="mt-2 text-sm">{editorError.message}</p>
        <Button 
          className="mt-4" 
          onClick={() => setEditorError(null)}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // No SidebarProvider needed here anymore
  return (
    <CodeEditorContent 
      currentTheme={currentTheme}
      activeFile={activeFile}
      setActiveFile={setActiveFile}
      editorInstance={editorInstance}
      defaultCode={defaultCode}
      handleEditorMount={handleEditorMount}
      editorContainerRef={editorContainerRef}
      consoleExpanded={consoleExpanded}
      toggleConsole={toggleConsole}
      handleConsoleResize={handleConsoleResize}
      handleCopyCode={handleCopyCode}
      handleDownloadCode={handleDownloadCode}
      isSidebarOpen={isSidebarOpen} // Pass state down
      toggleLocalSidebar={toggleLocalSidebar} // Pass handler down
    />
  );
}

function CodeEditorContent({
  currentTheme,
  activeFile,
  setActiveFile,
  editorInstance,
  defaultCode,
  handleEditorMount,
  editorContainerRef,
  consoleExpanded,
  toggleConsole,
  handleConsoleResize,
  handleCopyCode,
  handleDownloadCode,
  isSidebarOpen, // Receive state
  toggleLocalSidebar // Receive handler
}: {
  currentTheme: string,
  activeFile: string,
  setActiveFile: (file: string) => void,
  editorInstance: any,
  defaultCode: string,
  handleEditorMount: (editor: any, monaco: any) => void,
  editorContainerRef: React.RefObject<HTMLDivElement | null>, // Allow null here as well
  consoleExpanded: boolean,
  toggleConsole: () => void,
  handleConsoleResize: (sizes: number[]) => void,
  handleCopyCode: () => void,
  handleDownloadCode: () => void,
  isSidebarOpen: boolean, // Type for received state
  toggleLocalSidebar: () => void // Type for received handler
}) {
  return (
    <div className="bg-background text-foreground flex h-full flex-col overflow-hidden rounded-md" suppressHydrationWarning>
      <div className="border-border flex h-[41px] flex-shrink-0 items-center justify-between border-b p-2 bg-muted/30">
        <div className="flex items-center gap-2">
          {/* Sidebar Toggle Button */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground size-7"
                  onClick={toggleLocalSidebar}
                >
                  {isSidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
                  <span className="sr-only">{isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5}>
                <p className="text-xs">{isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Code className="text-primary size-5" />
          <h1 className="text-sm font-medium">Code Editor</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <RefreshCw className="mr-1 size-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="relative flex h-[calc(100%-41px)] flex-1 overflow-hidden" suppressHydrationWarning>
        {/* Simple Div Sidebar */}
        <div
          className={cn(
            "bg-muted/30 border-border flex h-full flex-col overflow-y-auto border-r transition-all duration-200 ease-in-out",
            isSidebarOpen ? "w-56 flex-shrink-0" : "w-0 flex-shrink-0 p-0 border-r-0", // Control width and padding
            !isSidebarOpen && "invisible opacity-0" // Hide content when closed
          )}
        >
          <div className="flex-shrink-0 p-2 pt-3">
            <h3 className="text-muted-foreground mb-2 text-xs font-medium">Project Files</h3>
          </div>
          <div className="flex-1 space-y-0.5 p-2 pt-0">
            {files.map((item) => (
              <FileTreeItem
                key={item.name}
                item={item}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
                level={0}
              />
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 h-full overflow-hidden" suppressHydrationWarning>
          <ClientOnly>
            <ErrorBoundary fallback={
              <div className="h-full flex items-center justify-center flex-col p-6">
                <h2 className="text-lg font-semibold text-red-500 mb-2">Something went wrong</h2>
                <p className="mb-4 text-sm text-center">The code editor encountered an error.</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            }>
              <Suspense fallback={
                <div className="h-full grid place-items-center">
                  <p className="text-muted-foreground">Loading editor panels...</p>
                </div>
              }>
                <SplitPane
                  className="h-full flex flex-col"
                  direction="vertical"
                  sizes={consoleExpanded ? [70, 30] : [95, 5]}  // Never let console size be 0
                  minSize={consoleExpanded ? 150 : 40}          // Ensure minimum heights
                  gutterSize={4}                                // Always show gutter
                  snapOffset={30}
                  dragInterval={1}
                  onDrag={handleConsoleResize}
                  gutterAlign="center"
                  gutterStyle={() => ({
                    backgroundColor: 'var(--border)',
                    height: '4px',
                    cursor: 'row-resize',
                  })}
                >
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="border-border bg-background flex h-[33px] flex-shrink-0 items-center justify-between border-b px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        {/* Existing File Info */}
                        <FileText className="text-muted-foreground size-3.5" />
                        <span className="text-xs font-medium">{activeFile}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground size-6"
                                onClick={handleCopyCode}
                              >
                                <Copy className="size-3.5" />
                                <span className="sr-only">Copy code</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={5}>
                              <p className="text-xs">Copy to clipboard</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground size-6"
                                onClick={handleDownloadCode}
                              >
                                <Download className="size-3.5" />
                                <span className="sr-only">Download file</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={5}>
                              <p className="text-xs">Download as file</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden"> {/* Changed height calculation */}
                      <MonacoEditorClient
                        currentTheme={currentTheme}
                        defaultCode={defaultCode}
                        onMount={handleEditorMount}
                        editorContainerRef={editorContainerRef}
                      />
                    </div>
                  </div>

                  <div className={`flex flex-col border-t border-border console-container`}>
                    <div className={cn("border-border flex h-[40px] items-center justify-between px-3 py-1.5 bg-background", consoleExpanded && "border-b")}>
                      <div className="flex items-center">
                        <Terminal className="text-muted-foreground mr-1.5 size-3.5" />
                        <span className="text-xs font-medium">Console</span>
                      </div>
                      <div className="flex items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground size-6"
                                onClick={toggleConsole}
                              >
                                {consoleExpanded ? (
                                  <ChevronDown className="size-3.5" />
                                ) : (
                                  <ChevronUp className="size-3.5" />
                                )}
                                <span className="sr-only">
                                  {consoleExpanded ? "Collapse console" : "Expand console"}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={5}>
                              <p className="text-xs">{consoleExpanded ? "Collapse" : "Expand"} console</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className={`bg-background flex-1 overflow-auto p-2 ${consoleExpanded ? 'h-[calc(100%-40px)]' : 'h-0'}`}>
                      <div className="text-muted-foreground flex h-full items-center justify-center text-xs italic">
                        No logs available to display
                      </div>
                    </div>
                  </div>
                </SplitPane>
              </Suspense>
            </ErrorBoundary>
          </ClientOnly>
        </div>
      </div>
      
      <Script id="handle-extension-attributes" strategy="afterInteractive">
        {`
          try {
            const extensionAttrs = document.body.getAttributeNames()
              .filter(attr => attr === 'cz-shortcut-listen' || attr.startsWith('data-extension-'));
            
            if (extensionAttrs.length > 0) {
              console.log('Found browser extension attributes:', extensionAttrs);
            }
          } catch (e) {
            console.error('Error in extension attribute handling script:', e);
          }
        `}
      </Script>
    </div>
  );
}

function FileTreeItem({
  item,
  activeFile,
  setActiveFile,
  level = 0
}: {
  item: any;
  activeFile?: string;
  setActiveFile: (file: string) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(() => !!item.expanded);
  const isFolder = item.type === 'folder';
  const Icon = isFolder ? (expanded ? FolderOpen : Folder) : FileText;

  const handleClick = () => {
    if (isFolder) {
      setExpanded(!expanded);
    } else {
      setActiveFile(item.name);
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex w-full cursor-pointer items-center rounded-sm px-2 py-1 text-xs",
          "hover:bg-accent/50",
          item.name === activeFile && "bg-accent/70 text-accent-foreground font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        <Icon className="text-muted-foreground mr-1.5 size-3.5 min-w-[14px]" />
        <span className="truncate">{item.name}</span>
      </div>

      {isFolder && expanded && item.children?.length > 0 && (
        <div className="w-full">
          {item.children.map((child: any) => (
            <FileTreeItem
              key={child.name}
              item={child}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
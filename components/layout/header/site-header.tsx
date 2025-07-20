"use client"

import { Button } from "@/components/ui/button"
import { MoonIcon, Search, SunIcon } from "lucide-react"
import Friday from "@/components/orb/friday"
import * as React from "react"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useCategorySidebar } from "@/components/layout/sidebar/category-sidebar"
import { NavActions } from "@/components/layout/sidebar/nav-actions"
import { useSubCategorySidebar } from "@/components/layout/sidebar/subcategory-sidebar"
import CategorySidebar from "@/components/layout/sidebar/category-app-sidebar"
import SubCategorySidebar from "@/components/layout/sidebar/subcategory-app-sidebar"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { lt } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { GlobeIcon, LockIcon, EyeOff, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { SidebarProvider } from "@/components/layout/sidebar/actions-sidebar"
import { useTheme } from "@/lib/theme"
import { createAnimation } from "@/lib/theme/theme-animations"
import { CommandMenu } from "@/components/layout/header/command-menu"
import { Circle, File, Laptop, Moon, Sun } from "lucide-react"
import { docsConfig } from "@/constants/command-palettle"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { v4 as uuidv4 } from "uuid"
import { Separator } from "@/components/ui/separator"
import { Profile } from "@/components/layout/header/profile"
import { CustomizerSidebarToggle } from "@/components/customizer/customizer-sidebar"


type ChatVisibility = "public" | "private" | "unlisted"

interface ChatData {
  id: string
  title: string
  visibility: ChatVisibility
  createdAt: string
  updatedAt: string
  creatorUid: string
}

const visibilityConfig = {
  public: {
    icon: <GlobeIcon className="size-1.5" />,
    text: "Public",
    description: "Visible to everyone",
  },
  private: {
    icon: <LockIcon className="size-1.5" />,
    text: "Private",
    description: "Only visible to you",
  },
  unlisted: {
    icon: <EyeOff className="size-1.5" />,
    text: "Unlisted",
    description: "Only accessible via link",
  },
} as const

export function SiteHeader() {
  const [language, setLanguage] = useState("English")
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  // const { toggleGoodSidebar, state } = useGoodSidebar()
  const { statecategorysidebar, toggleCategorySidebar } = useCategorySidebar()
  const { statesubcategorysidebar, toggleSubCategorySidebar } = useSubCategorySidebar()
  // const { user } = useAuth()
  // Hardcoded user for now
  const user = {
    uid: "test-user-uid",
    photoURL: "https://via.placeholder.com/150",
    displayName: "Test User",
    email: "test@example.com",
  }
  const { isMobile, state: leftSidebarState } = useSidebar()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const params = useParams()
  const queryClient = useQueryClient()
  const [isChangingVisibility, setIsChangingVisibility] = useState(false)
  const { theme, setTheme } = useTheme()
  const styleId = "theme-transition-styles"
  const [commandOpen, setCommandOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setCommandOpen(false)
    command()
  }, [])

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
    const animation = createAnimation(
      "gif",
      "center",
      "https://media.giphy.com/media/5PncuvcXbBuIZcSiQo/giphy.gif?cid=ecf05e47j7vdjtytp3fu84rslaivdun4zvfhej6wlvl6qqsz&ep=v1_stickers_search&rid=giphy.gif&ct=s"
    )

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
  }, [theme, setTheme, updateStyles])

  const { data: chatData, isLoading } = useQuery<ChatData | null>({
    queryKey: ["chat", params?.slug],
    queryFn: async () => {
      if (!params?.slug) return null;

      // Try to get from cache first
      // const cachedData = queryClient.getQueryData(["chat", params.slug])
      // if (cachedData) return cachedData as ChatData

      // const chatRef = doc(db, "chats", params.slug as string)
      // const chatDoc = await getDoc(chatRef)

      // if (!chatDoc.exists()) {
      //   return null
      // }

      // const data = {
      //   id: chatDoc.id,
      //   ...(chatDoc.data() as Omit<ChatData, "id">),
      // }

      // return data
      // Hardcoded chatData for now
      return {
        id: params.slug as string,
        title: "Hardcoded Chat Title",
        visibility: "public" as ChatVisibility,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creatorUid: "test-user-uid",
      };
    },
    enabled: !!params?.slug,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Add real-time updates with optimistic UI
  useEffect(() => {
    if (!params?.slug) return

    // const chatRef = doc(db, "chats", params.slug as string)
    // const unsubscribe = onSnapshot(chatRef, (doc) => {
    //   if (doc.exists()) {
    //     const data = {
    //       id: doc.id,
    //       ...doc.data(),
    //     }
    //     queryClient.setQueryData(["chat", params.slug], data)
    //   }
    // })

    // return () => unsubscribe()
    // No-op for now
    return () => { };
  }, [params?.slug, queryClient])

  useEffect(() => {
    // Update URL with chat session ID if needed
    if (chatData && params?.slug && pathname !== `/chat/${chatData.id}`) {
      router.replace(`/chat/${chatData.id}`)
    }
  }, [chatData, params?.slug, pathname, router])

  const title = chatData?.title || ""
  const visibility = chatData?.visibility || "public"

  const handleVisibilityChange = async (newVisibility: ChatVisibility) => {
    if (!params?.slug || newVisibility === visibility) return

    setIsChangingVisibility(true)
    try {
      // const chatRef = doc(db, "chats", params.slug as string)
      // await updateDoc(chatRef, {
      //   visibility: newVisibility,
      //   updatedAt: new Date().toISOString(),
      // })

      // Update React Query cache with proper typing
      queryClient.setQueryData<ChatData | null>(["chat", params.slug], (oldData) => {
        if (!oldData) return null
        return {
          ...oldData,
          visibility: newVisibility,
          updatedAt: new Date().toISOString(),
        }
      })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      console.log("Simulating visibility change to:", newVisibility);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation
    } catch (error) {
      console.error("Error updating visibility:", error)
    } finally {
      setIsChangingVisibility(false)
    }
  }

  // Firebase user data
  // const userImage = (user as FirebaseUser)?.photoURL
  // const userName = (user as FirebaseUser)?.displayName
  // const userEmail = (user as FirebaseUser)?.email
  // Hardcoded user details
  const userImage = user?.photoURL
  const userName = user?.displayName
  const userEmail = user?.email
  const fallbackInitial = userName?.[0] || userEmail?.[0]?.toUpperCase() || "U"

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      // await signOut(getAuth())
      console.log("Simulating logout");
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation
      router.push("/") // Redirect to home page
      toast.success(lt("authentication.successfully-logged-out-simulated", "Successfully logged out (simulated)"))
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error(lt("authentication.failed-to-logout", "Failed to log out"))
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      // const auth = getAuth()
      // const provider = new GoogleAuthProvider()
      // await signInWithPopup(auth, provider)
      console.log("Simulating login");
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation
      toast.success(lt("authentication.successfully-logged-in-simulated", "Successfully logged in (simulated)"))
    } catch (error) {
      console.error("Error signing in:", error)
      toast.error(lt("authentication.failed-to-login", "Failed to log in"))
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Get route name
  const getRouteName = () => {
    if (pathname === "/") return "Home"
    const lastSegment = pathname ? pathname.split("/").pop() : undefined
    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : "Home"
  }

  // Check if route is chat related
  const isChatRoute = pathname?.startsWith("/chat") ?? false

  const handleGoodSidebarToggle = () => {
    // toggleGoodSidebar()
    if (statesubcategorysidebar === "expanded") {
      toggleSubCategorySidebar()
    } else if (statecategorysidebar === "expanded") {
      toggleCategorySidebar()
    }
  }

  const handleCategorySidebarToggle = () => {
    toggleCategorySidebar()
    if (statesubcategorysidebar === "expanded") {
      toggleSubCategorySidebar()
    }
  }

  const handleSubCategorySidebarToggle = () => {
    toggleSubCategorySidebar()
    if (statecategorysidebar === "expanded") {
      toggleCategorySidebar()
    }
  }

  const renderChatHeader = () => {
    if (!params?.slug) return null

    if (isLoading) {
      return (
        <div className="flex items-center gap-1">
          <div className="bg-muted h-7 w-24 animate-pulse rounded"></div>
          <div className="bg-muted h-7 w-16 animate-pulse rounded"></div>
        </div>
      )
    }

    if (!chatData) return null

    return (
      <>
        <div className="xs:block xs:max-w-[85px] relative hidden max-w-[50px] overflow-hidden sm:max-w-[200px] md:max-w-[250px]">
          <span className="block truncate text-[13px] font-medium">
            {chatData.title || "Untitled Chat"}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="2xs:flex hover:bg-primary-foreground hover:text-primary h-7 items-center justify-center gap-1.5 rounded-full border px-2 md:flex"
              disabled={isChangingVisibility}
            >
              {isChangingVisibility ? (
                <>
                  <Loader2 className="size-[13px] animate-spin" />
                  <span className="flex h-full items-center text-[10px]">Changing...</span>
                </>
              ) : (
                <>
                  {visibilityConfig[chatData.visibility || "public"].icon}
                  <span className="flex h-full items-center text-[10px]">
                    {visibilityConfig[chatData.visibility || "public"].text}
                  </span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {Object.entries(visibilityConfig)
              .filter(([key]) => key !== visibility)
              .map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleVisibilityChange(key as ChatVisibility)}
                  className="flex items-center gap-2"
                  disabled={isChangingVisibility}
                >
                  {config.icon}
                  <div className="flex flex-col">
                    <span className="text-sm">{config.text}</span>
                    <span className="text-muted-foreground text-xs">{config.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  }

  // Add handleStartNew function from LeftSidebar
  const handleStartNew = useCallback(async () => {
    try {
      if (!user) {
        toast.error("Authentication required", {
          description: "Please sign in to start a new chat",
          duration: 3000,
        })
        return
      }

      // Generate a new UUID for the chat
      const chatId = uuidv4()

      // Create initial chat data with empty messages array
      const newChatData = { // Renamed to avoid conflict with existing chatData
        id: chatId,
        title: "New Conversation",
        messages: [], // Start with empty messages array
        model: "simulated-model", // Default model // aiService.currentModel,
        visibility: "public" as ChatVisibility, // Explicitly type visibility
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creatorUid: user.uid,
        reactions: {
          likes: {},
          dislikes: {},
        },
        participants: [user.uid],
        views: 0,
        uniqueViewers: [],
        isPinned: false,
      }

      // Store chat data in Firestore
      // await setDoc(doc(db, "chats", chatId), chatData)
      console.log("Simulating creation of new chat:", newChatData);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation


      // Store information in sessionStorage
      sessionStorage.setItem("selectedAI", "simulated-model" /*aiService.currentModel*/);
      sessionStorage.setItem("chatId", chatId)
      sessionStorage.setItem("isNewChat", "true")

      // Navigate to the new chat
      router.push(`/chat/${chatId}`)
      setOpen(false) // Close the sheet after starting new chat
    } catch (error) {
      console.error("Error creating new chat:", error)
      toast.error("Failed to create new chat", {
        description: "Please try again",
      })
    }
  }, [user, router])

  return (
    <header
      className={cn(
        "fixed top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex h-12 items-center border-b px-2 w-full",
        // Add transition for smooth changes
        "transition-all duration-200 ease-linear",
        // Base width and position - full width on mobile, default md width with 48px offset
        "left-0 w-full md:w-[calc(100%-48px)]",

        // Left sidebar positioning (after md breakpoint)
        leftSidebarState === "expanded"
          ? "md:w-[calc(100%-256px)] md:left-64" // When left sidebar is expanded
          : "md:left-12", // When collapsed

        // Width calculations based on sidebar states and viewport
        // When left sidebar is expanded
        leftSidebarState === "expanded" &&
          statecategorysidebar !== "expanded" &&
          statesubcategorysidebar !== "expanded"
          ? "md:w-[calc(100%-256px)]"
          : "",

        // When left sidebar is expanded + category sidebar
        leftSidebarState === "expanded" &&
          statecategorysidebar === "expanded" &&
          statesubcategorysidebar !== "expanded"
          ? "md:w-[calc(100%-256px)]"
          : "",

        // When left sidebar is expanded + subCategory sidebar
        leftSidebarState === "expanded" &&
          statecategorysidebar !== "expanded" &&
          statesubcategorysidebar === "expanded"
          ? "md:w-[calc(100%-256px)] "
          : "",

        statecategorysidebar === "expanded" ? "md:w-[calc(100%-256px)]" : "",
        statesubcategorysidebar === "expanded" ? "md:w-[calc(100%-256px)]" : ""
      )}
    >
      <div className="flex items-center space-x-1 flex-1">
        <CustomizerSidebarToggle />
        {!pathname?.startsWith("/chat") ? (
          <>
            <Friday className="md:hidden" orbSize={25} shapeSize={21} />
            <span className="hidden md:flex">
              {pathname === "/"
                ? "Home"
                : pathname
                  ? pathname.substring(1).charAt(0).toUpperCase() + pathname.substring(2)
                  : "Home"}
            </span>
          </>
        ) : (
          <div className="flex h-12 items-center gap-1">{renderChatHeader()}</div>
        )}
      </div>
      <div className="flex max-h-12 items-center">
        {isChatRoute && (
          <SidebarProvider>
            <NavActions />
          </SidebarProvider>
        )}
        <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
          <CommandMenu />
        </div>

        <Button
          onClick={() => setCommandOpen(true)}
          size={"sm"}
          variant="outline"
          className="size-8 md:hidden"
        >
          <Search className="h-4 w-4" />
        </Button>

        <div className="hidden">
          <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Links">
                {docsConfig.mainNav
                  .filter((navitem) => !navitem.external)
                  .map((navItem) => (
                    <CommandItem
                      key={navItem.href}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => (navItem.href ? router.push(navItem.href as any) : null))
                      }}
                    >
                      <File className="mr-2 h-4 w-4" />
                      {navItem.title}
                    </CommandItem>
                  ))}
              </CommandGroup>
              {docsConfig.sidebarNav.map((group) => (
                <CommandGroup key={group.title} heading={group.title}>
                  {group.items.map((navItem: any) => (
                    <CommandItem
                      key={navItem.href}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => (navItem.href ? router.push(navItem.href as any) : null))
                      }}
                    >
                      <div className="mr-2 flex h-4 w-4 items-center justify-center">
                        <Circle className="h-3 w-3" />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              <CommandSeparator />
              <CommandGroup heading="Theme">
                <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
                  <Laptop className="mr-2 h-4 w-4" />
                  System
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="group/toggle extend-touch-target size-8 mx-2"
          title="Toggle theme"
          onClick={toggleTheme}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4.5"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 3l0 18" />
            <path d="M12 9l4.65 -4.65" />
            <path d="M12 14.3l7.37 -7.37" />
            <path d="M12 19.6l8.85 -8.85" />
          </svg>
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Profile />
      </div>
      <CategorySidebar />
      <SubCategorySidebar />
    </header>
  )
}

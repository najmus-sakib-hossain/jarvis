"use client"

import * as React from "react"
import Link from "next/link"
import {
  AudioWaveform,
  Blocks,
  BookOpen,
  Bot,
  Calendar,
  CircleSlash2,
  Command,
  Ellipsis,
  Frame,
  GalleryVerticalEnd,
  Gift,
  Heart,
  Home,
  Info,
  LibraryBig,
  Map,
  MessageCircleQuestion,
  PanelRight,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
  SidebarRail,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { History } from "@/components/layout/sidebar/history"
import { TeamSwitcher } from "@/components/layout/sidebar/team-switcher"
import { useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Banner } from "@/components/layout/banner"

export function LeftSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar()
  const router = useRouter()
  // const { user } = useAuth(); // Corrected hook usage
  // Hardcoded user for now
  const user = {
    uid: "test-user-uid",
    photoURL: "https://via.placeholder.com/150",
    displayName: "Test User",
    email: "test@example.com",
  };

  // Create a handler function for the Start New button
  const handleStartNew = useCallback(async () => {
    try {
      if (!user) {
        toast.error("Authentication required", {
          description: "Please sign in to start a new chat",
          duration: 3000,
        });
        return;
      }

      // Generate a new UUID for the chat
      const chatId = uuidv4();

      // Create initial chat data with empty messages array
      const chatData = {
        id: chatId,
        title: "New Conversation",
        messages: [], // Start with empty messages array
        model: "simulated-model", // Default model // aiService.currentModel,
        visibility: "public",
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
      };

      // Store chat data in Firestore
      // await setDoc(doc(db, "chats", chatId), chatData);
      console.log("Simulating storing chat data:", chatData);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation

      // Store information in sessionStorage
      sessionStorage.setItem("selectedAI", "simulated-model" /*aiService.currentModel*/);
      sessionStorage.setItem("chatId", chatId)
      sessionStorage.setItem("isNewChat", "true")

      // Navigate to the new chat
      router.push(`/chat/${chatId}`)
    } catch (error) {
      console.error("Error creating new chat:", error)
      toast.error("Failed to create new chat", {
        description: "Please try again",
      })
    }
  }, [user, router])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="w-full p-0 ">
          <div className="mb-2 flex flex-col gap-1 px-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleStartNew}
                    className="flex min-h-8 min-w-8 items-center justify-center rounded-md text-sm border hover:bg-secondary"
                  >
                    {state === "expanded" ? "Start New" : <Plus className="size-4" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Start New Conversation</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <SidebarMenuButton>
                      <Home className="size-4 mr-2" />
                      Home
                    </SidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Home</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/automations">
                    <SidebarMenuButton>
                      <Sparkles className="size-4 mr-2" />
                      Automations
                    </SidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Automations</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/variants">
                    <SidebarMenuButton>
                      <CircleSlash2 className="size-4 mr-2" />
                      Varients
                    </SidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Varients</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/library">
                    <SidebarMenuButton>
                      <LibraryBig className="size-4 mr-2" />
                      Library
                    </SidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Library</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/projects">
                    <SidebarMenuButton>
                      <Blocks className="size-4 mr-2" />
                      Projects
                    </SidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Projects</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/spaces">
                    <SidebarMenuButton>
                      <Frame className="size-4 mr-2" />
                      Spaces
                    </SidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Spaces</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={{ pathname: "/more" }}>
                    <SidebarMenuButton>
                      <Ellipsis className="size-4 mr-2" />
                      More
                    </SidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>More Options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {state === "expanded" ? (
            <div className="">
              <div className="mx-auto h-auto w-[93%] border-t border-dashed" />
              <History />
            </div>
          ) : null}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {state === "expanded" ? (
          <Banner title="Info" message="Friday is still in beta so it can make mistakes." />
        ) : (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => {
                      toggleSidebar()
                    }}
                    className="flex min-h-8 min-w-8 items-center justify-center rounded-md"
                  >
                    <PanelRight className="size-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Expand Sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex min-h-8 min-w-8 items-center justify-center rounded-md">
                    <Info className="size-[18.5px]" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Friday is still in beta so it can make mistakes.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
        {/* <NavUser /> */}
      </SidebarFooter>
    </Sidebar>
  )
}

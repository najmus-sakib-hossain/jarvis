"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowUpRight,
  Link,
  MoreHorizontal,
  StarOff,
  Trash2,
  MessageSquare,
  Edit2,
  Loader,
  Search // Add Search icon
} from "lucide-react"
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth/auth-client';
import { db } from '@/db/index'; // Added Drizzle db
import { chats as chatsTable } from '@/db/schema'; // Added chats schema
import { eq, and, desc, asc } from 'drizzle-orm'; // Added Drizzle operators


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command" // Import Command components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { lt } from "@/lib/utils"

// Modify the Chat interface to include isPinned
interface Chat {
  id: string; // Kept as string, assuming it will be string from Drizzle
  name: string; // Ensure this maps to a field in your Drizzle 'chats' schema or adapt
  title: string;
  url: string; // This might need to be constructed or stored if not directly in schema
  emoji: string; // Ensure this maps or adapt
  creatorUid: string;
  lastMessage?: string; // Ensure this maps or adapt
  timestamp?: number; // Drizzle schema uses text for createdAt, updatedAt. Need conversion.
  isPinned?: boolean;
  // Add other fields from your Drizzle 'chats' schema if needed
  // e.g., messages, model, visibility, reactions, participants, views, uniqueViewers
  // For simplicity, keeping the interface minimal for now.
}

export function History() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useSidebar()

  useEffect(() => {
    const fetchUserSession = async () => {
      setIsAuthLoading(true);
      try {
        const session = await authClient.getSession();
        setAuthUser(session?.data);
      } catch (error) {
        toast.error("Failed to fetch user session.");
        // console.error("Failed to fetch user session:", error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    fetchUserSession();
  }, []);

  const currentChatId = pathname?.startsWith('/chat/')
    ? pathname.replace('/chat/', '')
    : null

  const userUid = authUser?.user?.id;

  const { data: fetchedChats = [], isLoading, error: chatsError } = useQuery<Chat[]>({
    queryKey: ['chats', userUid],
    queryFn: async () => {
      if (!userUid) return []

      const results = await db.select()
        .from(chatsTable)
        .where(eq(chatsTable.creatorUid, userUid))
        .orderBy(desc(chatsTable.isPinned), desc(chatsTable.updatedAt)) // Order by pinned then by date
        .execute();

      // Map Drizzle results to Chat interface
      return results.map(chat => ({
        id: chat.id,
        title: chat.title,
        name: chat.title, // Assuming title can be used as name for now
        url: `/chat/${chat.id}`, // Construct URL
        emoji: "💬", // Placeholder emoji, consider adding to schema or deriving
        creatorUid: chat.creatorUid,
        // Convert string dates to timestamp numbers if your Chat interface expects numbers
        // For Drizzle, createdAt and updatedAt are text. If you need a number timestamp:
        timestamp: chat.updatedAt ? new Date(chat.updatedAt).getTime() : undefined,
        isPinned: chat.isPinned || false,
        // lastMessage: chat.messages ? chat.messages[chat.messages.length-1]?.content : undefined // Example if messages is an array of objects
      }));
    },
    enabled: !!userUid && !isAuthLoading,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })

  // Real-time updates with Drizzle are more complex and typically require a separate subscription mechanism
  // (e.g., WebSockets, server-sent events, or a service like Pusher/Ably)
  // For now, this useEffect for real-time updates will be commented out or removed
  // as Drizzle ORM itself doesn't provide real-time subscription out-of-the-box like Firestore.
  /*
  useEffect(() => {
    if (!userUid || isAuthLoading) return;

    // Placeholder for potential real-time update logic if you implement one
    // This would involve setting up a listener to your backend that pushes updates
    // and then invalidating the queryClient cache for ['chats', userUid]

    return () => {
      // Cleanup listener if any
    };
  }, [queryClient, userUid, isAuthLoading]);
  */

  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<{ id: string, title: string } | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  // Debug rendered state
  // useEffect(() => {
  //   // console.log('Rendered chats:', chats)
  //   // console.log('Is loading:', isLoading)
  // }, [chats, isLoading])

  const handleRename = async (chatId: string, currentTitle: string) => {
    setSelectedChat({ id: chatId, title: currentTitle })
    setNewTitle(currentTitle)
    setIsRenameOpen(true)
  }

  const confirmRename = async () => {
    if (!selectedChat || !newTitle || newTitle === selectedChat.title) {
      setIsRenameOpen(false)
      return
    }

    try {
      // await db.update(chatsTable)
      //   .set({ title: newTitle, updatedAt: new Date().toISOString() })
      //   .where(eq(chatsTable.id, selectedChat.id))
      //   .execute();
      // queryClient.invalidateQueries({ queryKey: ['chats', userUid] })
      toast.success("Chat renamed successfully")
    } catch (error) {
      console.error("Error renaming chat:", error)
      toast.error("Failed to rename chat")
    }
    setIsRenameOpen(false)
  }

  const handleDelete = (chatId: string, title: string) => {
    setSelectedChat({ id: chatId, title })
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedChat) return

    try {
      await db.delete(chatsTable)
        .where(eq(chatsTable.id, selectedChat.id))
        .execute();
      queryClient.invalidateQueries({ queryKey: ['chats', userUid] })
      toast.success("Chat deleted successfully")
      if (currentChatId === selectedChat.id) {
        router.push('/')
      }
    } catch (error) {
      console.error("Error deleting chat:", error)
      toast.error("Failed to delete chat")
    }
    setIsDeleteOpen(false)
  }

  const handleCopyLink = (chatId: string) => {
    const url = `${window.location.origin}/chat/${chatId}`
    navigator.clipboard.writeText(url)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"))
  }

  const handleOpenNewTab = (chatId: string) => {
    window.open(`/chat/${chatId}`, '_blank')
  }

  // Modify the handleTogglePin function to also update the timestamp
  const handleTogglePin = async (chatId: string, currentPinned: boolean) => {
    if (!userUid) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      // await db.update(chatsTable)
      //   .set({ isPinned: !currentPinned, updatedAt: new Date().toISOString() })
      //   .where(eq(chatsTable.id, chatId))
      //   .execute();
      // queryClient.invalidateQueries({ queryKey: ['chats', userUid] });
      toast.success(`Chat ${!currentPinned ? "pinned" : "unpinned"} successfully`);
    } catch (error) {
      console.error("Error toggling pin status:", error);
      toast.error("Failed to toggle pin status.");
    }
  }

  // Update prefetchChat to use strict UID checking
  // const prefetchChat = async (chatId: string) => {
  //   await queryClient.prefetchQuery({
  //     queryKey: ['chat', chatId],
  //     queryFn: async () => {
  //       // const chatRef = doc(db, "chats", chatId)
  //       // const chatDoc = await getDoc(chatRef)

  //       // if (!chatDoc.exists()) return null

  //       // const data = chatDoc.data()
  //       // if (data.creatorUid !== userUid) {
  //       //   console.warn(`Unauthorized access attempt to chat ${chatId}`)
  //       //   return null
  //       // }

  //       // return {
  //       //   id: chatDoc.id,
  //       //   ...data
  //       // }
  //       // console.log(`Simulating prefetch for chat ${chatId}`);
  //       await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async fetch
  //       // Return a hardcoded chat object or null if not found in a simulated list
  //       const simulatedChat = chats.find((c: Chat) => c.id === chatId); // Added explicit type for c
  //       if (simulatedChat && simulatedChat.creatorUid === userUid) {
  //         return { ...simulatedChat };
  //       }
  //       if (chatId === 'chat1' && userUid === 'test-user-uid') {
  //         return { id: 'chat1', title: 'Hardcoded Chat 1', name: 'HC Chat 1', url: '/chat/chat1', emoji: '😀', creatorUid: userUid, lastMessage: 'Hello', timestamp: Date.now(), isPinned: true, visibility: 'public' };
  //       }
  //       return null;
  //     },
  //     staleTime: 1000 * 30
  //   })
  // }

  // Function to handle search
  const handleSearch = (chatId: string) => {
    router.push(`/chat/${chatId}`)
    setIsCommandOpen(false)
  }

  if (isAuthLoading) {
    return (
      <div className="px-1 py-0 text-start text-sm">
        <Loader className="animate-spin inline-block mr-2 size-4" />
        Loading user...
      </div>
    );
  }

  if (!userUid) {
    return (
      <div className="px-1 py-0 text-start text-sm text-muted-foreground">
        {lt("chat-history-notice", "You need to be logged in to view your chat history.")}
      </div>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="px-1 py-0 text-start">
          <Loader className="animate-spin inline-block mr-2 size-4" />
          Loading chats...
        </div>
      </SidebarGroup>
    );
  }

  if (chatsError) {
    return (
        <div className="px-1 py-0 text-start text-red-500">
          Error loading chats.
        </div>
    );
  }

  // Group chats by pinned and unpinned
  const pinnedChats = fetchedChats.filter(chat => chat.isPinned);
  const unpinnedChats = fetchedChats.filter(chat => !chat.isPinned);

  return (
    <>
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Search chats or type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {/* You can add command items here if needed */}
        </CommandList>
      </CommandDialog>

      <SidebarGroup>
        <div className="flex items-center justify-between p-2">
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setIsCommandOpen(true)}>
              <Search className="size-3.5" />
            </Button>
            {/* Add other actions here if needed */}
          </div>
        </div>
        <SidebarMenu>
          {pinnedChats.length === 0 && unpinnedChats.length === 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No chats yet. Start a new conversation!
            </div>
          )}

          {pinnedChats.length > 0 && (
            <>
              {/* <SidebarGroupLabel className="text-xs px-2 pt-2 text-muted-foreground">Pinned</SidebarGroupLabel> */}
              {pinnedChats.map((chat) => (
                <SidebarMenuItem
                  key={chat.id}
                  // chatId={chat.id}
                  // href={`/chat/${chat.id}`}
                  title={chat.title || chat.name || "Untitled Chat"}
                // emoji={chat.emoji || "💬"}
                // isActive={currentChatId === chat.id}
                // isMobile={isMobile}
                // isPinned={true} // Pass isPinned status
                // onRename={() => handleRename(chat.id, chat.title || chat.name || "Untitled Chat")}
                // onDelete={() => handleDelete(chat.id, chat.title || chat.name || "Untitled Chat")}
                // onCopyLink={() => handleCopyLink(chat.id)}
                // onOpenNewTab={() => handleOpenNewTab(chat.id)}
                // onTogglePin={() => handleTogglePin(chat.id, chat.isPinned || false)}
                />
              ))}
            </>
          )}

          {unpinnedChats.length > 0 && (
            <>
              {/* {pinnedChats.length > 0 && <SidebarGroupLabel className="text-xs px-2 pt-3 text-muted-foreground">Recent</SidebarGroupLabel>} */}
              {unpinnedChats.map((chat) => (
                <SidebarMenuItem
                  key={chat.id}
                  // chatId={chat.id}
                  // href={`/chat/${chat.id}`}
                  title={chat.title || chat.name || "Untitled Chat"}
                // emoji={chat.emoji || "💬"}
                // isActive={currentChatId === chat.id}
                // isMobile={isMobile}
                // isPinned={false} // Pass isPinned status
                // onRename={() => handleRename(chat.id, chat.title || chat.name || "Untitled Chat")}
                // onDelete={() => handleDelete(chat.id, chat.title || chat.name || "Untitled Chat")}
                // onCopyLink={() => handleCopyLink(chat.id)}
                // onOpenNewTab={() => handleOpenNewTab(chat.id)}
                // onTogglePin={() => handleTogglePin(chat.id, chat.isPinned || false)}
                />
              ))}
            </>
          )}
        </SidebarMenu>
      </SidebarGroup>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new title for &quot;{selectedChat?.title}&quot;.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New chat title"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
            <Button onClick={confirmRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedChat?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

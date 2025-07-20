"use client"

import { useState } from "react"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Key,
  Sparkles,
} from "lucide-react"
// import { User as FirebaseUser, getAuth, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
// import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import {
  AnimationStart,
  AnimationVariant,
  createAnimation,
} from "@/lib/theme/theme-animations"
import { cn, lt } from "@/lib/utils"


export function NavUser() {
  // const { user } = useAuth()
  // Hardcoded user for now
  const user = {
    uid: 'test-user-uid',
    photoURL: 'https://via.placeholder.com/150',
    displayName: 'Test User',
    email: 'test@example.com',
  }
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
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
    const animation = createAnimation("gif", "center", "https://media.giphy.com/media/5PncuvcXbBuIZcSiQo/giphy.gif?cid=ecf05e47j7vdjtytp3fu84rslaivdun4zvfhej6wlvl6qqsz&ep=v1_stickers_search&rid=giphy.gif&ct=s")

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


  // Firebase user data
  // const userImage = (user as FirebaseUser)?.photoURL
  // const userName = (user as FirebaseUser)?.displayName
  // const userEmail = (user as FirebaseUser)?.email
  // Use hardcoded user details
  const userImage = user?.photoURL;
  const userName = user?.displayName;
  const userEmail = user?.email;
  const fallbackInitial = userName?.[0] || userEmail?.[0]?.toUpperCase() || "U"

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      // await signOut(getAuth())
      console.log('Simulating logout');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation
      router.push("/") // Redirect to home page
      toast.success(lt("authentication.successfully-logged-out-simulated", "You have been logged out successfully!"))
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
      console.log('Simulating login');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation
      toast.success(lt("authentication.successfully-logged-in-simulated", "You have been logged in successfully!"))
    } catch (error) {
      console.error("Error signing in:", error)
      toast.error(lt("authentication.failed-to-login", "Failed to log in"))
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Conditional rendering for login button if user is null (example)
  // To test this, you would set the hardcoded user above to: const user = null;
  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground text-sm h-10 px-2.5 bg-background/40 dark:hover:bg-background hover:bg-primary-foreground hover:border-border dark:border-primary-foreground border"
          >
            <div className="flex items-center justify-center rounded-lg">
              <Key className="size-4" />
            </div>
            {isLoggingIn ? lt("authentication.signing-in") : lt("authentication.sign-in-with-google")}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }
  

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-background"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={userImage ?? undefined} alt={userName || 'User'} />
                <AvatarFallback className="rounded-lg">{fallbackInitial}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-sm font-semibold">{userName}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={userImage ?? undefined} alt={userName || 'User'} />
                  <AvatarFallback className="rounded-lg">{fallbackInitial}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-sm font-semibold">{userName}</span>
                  <span className="truncate text-xs">{userEmail}</span>
                </div>

              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={toggleTheme}
            >
              {theme === "light" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" /> }
              {theme === "light" ? "Dark" : "Light"} Mode
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="size-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

"use client"

import Link from "next/link"
import { Home, Sparkles, CircleSlash2, LibraryBig, Ellipsis } from "lucide-react"
import { cn } from "@/lib/utils"
import { useParams, usePathname } from "next/navigation"
import { useCategorySidebar } from "@/components/layout/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/layout/sidebar/subcategory-sidebar"
import { useEffect, useState } from "react"

export function BottomBar() {
  const params = useParams()
  const pathname = usePathname()
  const { statecategorysidebar } = useCategorySidebar()
  const { statesubcategorysidebar } = useSubCategorySidebar()
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [initialHeight, setInitialHeight] = useState(0)

  // More robust check for chat pages
  const isChatsPage = pathname ? pathname.includes('/chat') : false

  // Detect keyboard visibility based on viewport height changes
  useEffect(() => {
    // Save initial window height on first render
    if (typeof window !== "undefined") {
      setInitialHeight(window.innerHeight)
      
      const handleResize = () => {
        // If window height reduced significantly (by at least 25%), assume keyboard is open
        // This threshold may need adjustment based on testing with different devices
        const heightDifference = initialHeight - window.innerHeight
        const heightChangePercentage = (heightDifference / initialHeight) * 100
        
        if (heightChangePercentage > 25) {
          setIsKeyboardVisible(true)
        } else {
          setIsKeyboardVisible(false)
        }
      }
      
      // Also detect focus on input elements as an additional hint
      const handleFocus = (e: FocusEvent) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          // Small delay to match the keyboard animation
          setTimeout(() => setIsKeyboardVisible(true), 100)
        }
      }
      
      const handleBlur = () => {
        // Small delay to handle cases where focus moves between inputs
        setTimeout(() => {
          // Only reset if no input element is focused
          if (!document.querySelector('input:focus, textarea:focus')) {
            setIsKeyboardVisible(false)
          }
        }, 100)
      }

      window.addEventListener('resize', handleResize)
      document.addEventListener('focusin', handleFocus)
      document.addEventListener('focusout', handleBlur)
      
      return () => {
        window.removeEventListener('resize', handleResize)
        document.removeEventListener('focusin', handleFocus)
        document.removeEventListener('focusout', handleBlur)
      }
    }
  }, [initialHeight])

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home"
    },
    {
      href: "/automations",
      icon: Sparkles,
      label: "Automations"  
    },
    {
      href: "/variants",
      icon: CircleSlash2,
      label: "Variants"
    },
    {
      href: "/library",
      icon: LibraryBig,
      label: "Library"
    },
    {
      href: "/more",
      icon: Ellipsis,
      label: "More"
    }
  ]

  // Don't render the component at all if on chat pages
  if (isChatsPage) {
    return null;
  }

  return (
    <nav className={cn(
      "bg-background fixed bottom-0 z-50 flex h-12 items-center justify-around border-t transition-all duration-200",
      "w-full", // Always full width on mobile
      isKeyboardVisible ? "translate-y-full opacity-0" : "translate-y-0 opacity-100",
      "md:hidden lg:hidden", // Hide on larger screens
    )}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={{ pathname: item.href }}
          className={cn(
            "flex flex-col items-center gap-1",
            params?.slug === item.href.replace("/", "") 
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <item.icon className="size-4" />
          <span className="text-[8.5px]">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
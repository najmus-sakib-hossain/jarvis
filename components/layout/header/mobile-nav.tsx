"use client"

import * as React from "react"
import Link, { LinkProps } from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn, lt, loadLocaleData } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)
  const pathname = usePathname()

  // Preload locale data when component mounts or pathname changes
  React.useEffect(() => {
    // Reset loaded state when path changes
    setLoaded(false)

    const loadLocale = async () => {
      try {
        // Get locale from pathname (first segment after /)
        const pathLocale = pathname?.split('/')[1] || 'en';
        await loadLocaleData(pathLocale as any)
        setLoaded(true)
      } catch (err) {
        console.error("Failed to load locale data:", err)
        setError(true)
        setLoaded(true)
      }
    }

    loadLocale()
  }, [pathname]) // Add pathname as dependency to reload when route changes

  // Get current locale from pathname
  const getCurrentLocale = () => {
    if (!pathname) return "en";
    const segments = pathname.split('/');
    return segments[1] || "en";
  }
  
  // Helper to get locale-prefixed paths
  const getLocalizedPath = (path: string) => {
    const locale = getCurrentLocale();
    // Remove leading slash if it exists
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    // Return locale-prefixed path
    return `/${locale}${cleanPath ? `/${cleanPath}` : ''}`;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden h-10"
        >
          <svg
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
          >
            <path
              d="M3 5H11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M3 12H16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M3 19H21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <MobileLink
          href={getLocalizedPath("/")}
          className="flex items-center mt-2"
          onOpenChange={setOpen}
        >
          <Image width={25} height={25} src="/portfolio.png" alt="bijoy" className="rounded-full ml-4 mr-2 mt-0.5" />

          <span className="font-bold">Tanvir Hasan Bijoy</span>
        </MobileLink>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <MobileLink
              href={getLocalizedPath("/")}
              onOpenChange={setOpen}
            >
              {loaded ? (error ? "Home" : lt("home")) : "Home"}
            </MobileLink>
            <MobileLink
              href={getLocalizedPath("contents")}
              onOpenChange={setOpen}
            >
              {loaded ? (error ? "Contents" : lt("contents")) : "Contents"}
            </MobileLink>
            {/* <MobileLink
              href="/about"
              onOpenChange={setOpen}
            >
              {loaded ? (error ? "About" : lt("about")) : "About"}
            </MobileLink> */}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter()
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString())
        onOpenChange?.(false)
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  )
}

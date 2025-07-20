"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn, lt, loadLocaleData } from "@/lib/utils"
import { useEffect, useState } from "react"

export function MainNav() {
  const pathname = usePathname()
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Get current locale from pathname
  const getCurrentLocale = () => {
    if (!pathname) return "en"
    const segments = pathname.split("/")
    return segments[1] || "en"
  }

  // Helper to get locale-prefixed paths
  const getLocalizedPath = (path: string) => {
    const locale = getCurrentLocale()
    // Remove leading slash if it exists
    const cleanPath = path.startsWith("/") ? path.substring(1) : path
    // Return locale-prefixed path
    return `/${locale}${cleanPath ? `/${cleanPath}` : ""}`
  }

  // Preload locale data when component mounts or pathname changes
  useEffect(() => {
    // Reset loaded state when path changes
    setLoaded(false)

    const loadLocale = async () => {
      try {
        // Get locale from pathname (first segment after /)
        const pathLocale = pathname?.split("/")[1] || "en"
        await loadLocaleData(pathLocale as any)
        setLoaded(true)
      } catch (err) {
        console.error("Failed to load locale data:", err)
        setError(true)
        setLoaded(true)
      }
    }

    loadLocale()
  }, [pathname])

  return (
    <div className="mr-4 hidden md:flex">
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        <Link
          href={getLocalizedPath("/")}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === `/${getCurrentLocale()}` || pathname === `/${getCurrentLocale()}/`
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          {loaded ? (error ? "Home" : lt("home", "Home")) : "Home"}
        </Link>
        <Link
          href={getLocalizedPath("contents")}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.includes(`/${getCurrentLocale()}/contents`)
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          {loaded ? (error ? "Contents" : lt("contents")) : "Contents"}
        </Link>
        {/* <Link
          href="/about"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/about")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          {loaded ? (error ? "About" : lt("about")) : "About"}
        </Link> */}
      </nav>
    </div>
  )
}

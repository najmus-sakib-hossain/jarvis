import { cn } from "@/lib/utils"
import { ElementType, ComponentPropsWithoutRef, useState } from "react"

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  speed?: string
  className?: string
  children: React.ReactNode
}

export function Border<T extends ElementType = "button">({
  as,
  className,
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || "button"
  const defaultColor = color || "hsl(var(--foreground))"
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      <Component
        className={cn(
          "relative inline-block py-[1px] overflow-hidden rounded-[20px]",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <div
          className={cn(
            "absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0",
            "opacity-20 dark:opacity-70"
          )}
          style={{
            background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
            animationDuration: speed,
            animationPlayState: isHovered ? "running" : "paused",
          }}
        />
        <div
          className={cn(
            "absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0",
            "opacity-20 dark:opacity-70"
          )}
          style={{
            background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
            animationDuration: speed,
            animationPlayState: isHovered ? "running" : "paused",
          }}
        />
        <div className={cn(
          "relative z-1 border text-foreground text-center text-base py-4 px-6 rounded-[20px]",
          "bg-gradient-to-b from-background/90 to-muted/90 border-border/40",
          "dark:from-background dark:to-muted dark:border-border"
        )}>
          {children}
        </div>
      </Component>
            <style>
        {`
          @keyframes star-movement-bottom {
            0% { transform: translate(0%, 0%); opacity: 1; }
            100% { transform: translate(-100%, 0%); opacity: 0; }
          }
          @keyframes star-movement-top {
            0% { transform: translate(0%, 0%); opacity: 1; }
            100% { transform: translate(100%, 0%); opacity: 0; }
          }
          .animate-star-movement-bottom {
            animation: star-movement-bottom linear infinite alternate;
          }
          .animate-star-movement-top {
            animation: star-movement-top linear infinite alternate;
          }
        `}
      </style>
    </>
  )
}
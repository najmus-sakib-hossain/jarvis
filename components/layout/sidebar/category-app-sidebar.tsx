'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Blocks,
  Box,
  CircleSlash2,
  Computer,
  Frame,
  Home,
  Image,
  LibraryBig,
  Music,
  PanelLeft,
  PenTool,
  RectangleGoggles,
  Sparkles,
  Video,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CategorySidebar,
  CategorySidebarContent,
  CategorySidebarFooter,
  CategorySidebarHeader,
  CategorySidebarMenuButton,
  useCategorySidebar,
  CategorySidebarMenu, CategorySidebarMenuItem,
} from '@/components/layout/sidebar/category-sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { History } from '@/components/layout/sidebar/history'

export function TeamSwitcher() {
  const { toggleCategorySidebar, statecategorysidebar } = useCategorySidebar()

  return (
    <CategorySidebarMenu>
      <CategorySidebarMenuItem>
        <div className="peer/menu-button font-medium ring-sidebar-ring data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground flex h-8 w-full items-center gap-2 rounded-md p-2 !px-0 text-left text-sm outline-none transition-[width,height,padding] focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0">
          Category Sidebar
          {statecategorysidebar === 'expanded' ? (
            <PanelLeft
              onClick={() => {
                toggleCategorySidebar()
              }}
              className="ml-auto"
            />
          ) : null}
        </div>
      </CategorySidebarMenuItem>
    </CategorySidebarMenu>
  )
}

export default function CategorySidebarApp({ ...props }: React.ComponentProps<typeof CategorySidebar>) {
    const { toggleCategorySidebar, statecategorysidebar } = useCategorySidebar()

  return (
    <CategorySidebar side="right" {...props}>
      <CategorySidebarHeader>
        <TeamSwitcher />
      </CategorySidebarHeader>
      <CategorySidebarContent>
        <ScrollArea className="w-full p-0 ">
          <div className="mb-2 flex flex-col gap-1 px-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <PenTool className="size-4" />
                      Text
                    </CategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Text</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/automations">
                    <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Image className="size-4" />
                      Image
                    </CategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Image</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/variants">
                    <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Music className="size-4" />
                      Audio
                    </CategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Audio</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/library">
                    <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Video className="size-4" />
                      Video
                    </CategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Video</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/projects">
                    <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Box className="size-4" />
                      3d
                    </CategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>3d</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/spaces">
                    <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <RectangleGoggles className="size-4" />
                      Ar
                    </CategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Ar</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/spaces">
                    <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Computer className="size-4" />
                      Vr
                    </CategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Vr</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {statecategorysidebar === 'expanded' ? (
            <div className="">
              <div className="mx-auto h-auto w-[93%] border-t border-dashed" />
              <History />
            </div>
          ) : null}
        </ScrollArea>
      </CategorySidebarContent>
    </CategorySidebar>
  )
}

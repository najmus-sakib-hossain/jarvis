'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Blocks,
  CircleSlash2,
  Frame,
  Globe,
  Home,
  LibraryBig,
  Monitor,
  MonitorSmartphone,
  PanelRight,
  Sparkles,
  TabletSmartphone,
  Tv,
  Watch,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SubCategorySidebar,
  SubCategorySidebarContent,
  SubCategorySidebarFooter,
  SubCategorySidebarHeader,
  SubCategorySidebarMenuButton,
  useSubCategorySidebar,
  SubCategorySidebarMenu,
  SubCategorySidebarMenuItem,
} from '@/components/layout/sidebar/subcategory-sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { History } from '@/components/layout/sidebar/history'

export function TeamSwitcher() {
  const { toggleSubCategorySidebar, statesubcategorysidebar } = useSubCategorySidebar()

  return (
    <SubCategorySidebarMenu>
      <SubCategorySidebarMenuItem>
        <div className="peer/menu-button font-medium ring-sidebar-ring data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground flex h-8 w-full items-center gap-2 rounded-md p-2 !px-0 text-left text-sm outline-none transition-[width,height,padding] focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0">
          Sub Category Sidebar
          {statesubcategorysidebar === 'expanded' ? (
            <PanelRight
              onClick={() => {
                toggleSubCategorySidebar()
              }}
              className="ml-auto"
            />
          ) : null}
        </div>
      </SubCategorySidebarMenuItem>
    </SubCategorySidebarMenu>
  )
}

export default function SubCategorySidebarApp({
  ...props
}: React.ComponentProps<typeof SubCategorySidebar>) {
  const { toggleSubCategorySidebar, statesubcategorysidebar } = useSubCategorySidebar()

  return (
    <SubCategorySidebar side="right" {...props}>
      <SubCategorySidebarHeader>
        <TeamSwitcher />
      </SubCategorySidebarHeader>
      <SubCategorySidebarContent>
        <ScrollArea className="w-full p-0 ">
          <div className="mb-2 flex flex-col gap-1 px-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Globe className="size-4" />
                      Website
                    </SubCategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Website</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <TabletSmartphone className="size-4" />
                      Mobile
                    </SubCategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Mobile</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Monitor className="size-4" />
                      Desktop
                    </SubCategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Desktop</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Tv className="size-4" />
                      Tv
                    </SubCategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Tv</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Watch className="size-4" />
                      Watch
                    </SubCategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Watch</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/automations">
                    <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Sparkles className="size-4" />
                      Image
                    </SubCategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Image</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/variants">
                    <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <CircleSlash2 className="size-4" />
                      Audio
                    </SubCategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Audio</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/library">
                    <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <LibraryBig className="size-4" />
                      Video
                    </SubCategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Video</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/projects">
                    <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Blocks className="size-4" />
                      3d
                    </SubCategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>3d</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/spaces">
                    <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Frame className="size-4" />
                      Ar
                    </SubCategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Ar</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/spaces">
                    <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Frame className="size-4" />
                      Vr
                    </SubCategorySidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Vr</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </ScrollArea>
      </SubCategorySidebarContent>
    </SubCategorySidebar>
  )
}

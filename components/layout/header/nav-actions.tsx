"use client";

import { usePathname } from "next/navigation";
import {
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    SidebarMenu,
} from "@/components/ui/sidebar";
import * as React from "react";
import {
    useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link"
import {
    Blocks,
    CircleSlash2,
    Ellipsis,
    Frame,
    Home,
    Info,
    LibraryBig,
    Plus,
    Sparkles,
} from "lucide-react"
import {
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { lt } from "@/lib/utils";
import { History } from "@/components/layout/sidebar/history";

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
    collapseIcon?: LucideIcon;
    className?: string;
}

export const mainNav: NavItem[] = [
    {
        title: "Start New",
        href: "/chat",
        collapseIcon: Plus,
        className: "border rounded-md mb-0.5 text-center justify-center"
    },
    {
        title: "Home",
        href: "/",
        icon: Home,
    },
    {
        title: "Automations",
        href: "/automations",
        icon: Sparkles,
    },
    {
        title: "Variants",
        href: "/variants",
        icon: CircleSlash2,
    },
    {
        title: "Library",
        href: "/library",
        icon: LibraryBig,
    },
    {
        title: "Projects",
        href: "/projects",
        icon: Blocks,
    },
    {
        title: "Spaces",
        href: "/spaces",
        icon: Frame,
    },
    {
        title: "More",
        href: "/more",
        icon: Ellipsis,
    },
];

interface NavDesktopActionsProps {
    items?: NavItem[];
}

export function NavDesktopActions({ items = mainNav }: NavDesktopActionsProps) {
    const { state } = useSidebar();
    const pathname = usePathname();

    return (
        <div className="hidden md:flex">
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <SidebarMenuItem key={item.title}>
                            <Link href={item.href} passHref>
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    isActive={isActive}
                                    className={cn(item.className, "w-full")}
                                >
                                    {item.icon && <item.icon className={cn(
                                        "size-4 shrink-0",
                                        state === "expanded" && "mr-2"
                                    )}
                                    />}
                                    {state === "expanded" && (
                                        <span className="truncate">
                                            {item.title}
                                        </span>
                                    )}
                                    {state !== "expanded" && item.collapseIcon && <item.collapseIcon className="size-5" />}
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
            {state === "expanded" && (<>
                <div className="mx-auto h-auto w-[99%] border-t border-dashed" />
                <History />
            </>)}
        </div>
    );
}

export function NavMobileActions() {
    return (
        <div className="flex flex-col gap-1 w-full md:hidden">
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        // onClick={handleStartNew}
                        className="mx-1.5 flex min-h-8 min-w-8 items-center justify-center rounded-md text-sm border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                        {lt("new", "New")}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>
                        {lt("new", "New")}
                    </p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                        <Home className="size-4 mr-2" />
                        {lt("home", "Home")}

                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>
                        {lt("home", "Home")}
                    </p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/automations" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                        <Sparkles className="size-4 mr-2" />
                        {lt("automations", "Automations")}
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{lt("automations", "Automations")}</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/variants" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                        <CircleSlash2 className="size-4 mr-2" />
                        {lt("variants", "Variants")}
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{lt("variants", "Variants")}</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/library" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                        <LibraryBig className="size-4 mr-2" />
                        {lt("library", "Library")}
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{lt("library", "Library")}</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/projects" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                        <Blocks className="size-4 mr-2" />
                        {lt("projects", "Projects")}
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{lt("projects", "Projects")}</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/spaces" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                        <Frame className="size-4 mr-2" />
                        {lt("spaces", "Spaces")}
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{lt("spaces", "Spaces")}</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={{ pathname: "/more" }} className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                        <Ellipsis className="size-4 mr-2" />
                        {lt("more", "More")}
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{lt("more", "More")}</p>
                </TooltipContent>
            </Tooltip>


            <div className="mx-auto h-auto w-[93%] border-t border-dashed" />
            <History />
        </div>
    );
}

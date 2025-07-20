"use client"

import { LocaleProvider } from "@/components/common/locale-provider";
import { Toaster as DefaultToaster, Toaster as NewYorkToaster } from "@/components/ui/toaster"
import { SubCategorySidebarProvider } from "@/components/layout/sidebar/subcategory-sidebar"
import { CategorySidebarProvider } from "@/components/layout/sidebar/category-sidebar"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster as NewYorkSonner } from "@/components/ui/sonner"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeSync } from "@/providers/theme-sync";
import { SiteHeader } from "@/components/layout/header/site-header"
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Main } from "@/providers/main"
import { Provider as JotaiProvider } from "jotai"
import { Suspense } from "react";
import * as React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CustomizerSidebar,
  CustomizerSidebarToggle,
} from "@/components/customizer/customizer-sidebar";
import { ChatProvider } from "./chat-provider";
import { DX } from "@/components/dx";

const SIDEBAR_WIDTH = "21rem";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function Providers({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <DX>
      <LocaleProvider>
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>
            <JotaiProvider>
              <TooltipProvider>
                <SidebarProvider
                  defaultOpen={false}
                >
                  <CustomizerSidebar />
                  <CategorySidebarProvider>
                    <SubCategorySidebarProvider>
                      <div
                        vaul-drawer-wrapper=""
                        className="relative h-screen w-full overflow-hidden"
                      >
                        <SiteHeader />
                        <Main>
                          <ChatProvider>
                            <Suspense>
                              {children}
                              <ThemeSync />
                            </Suspense>
                          </ChatProvider>
                        </Main>
                        <NewYorkToaster />
                        <DefaultToaster />
                        <NewYorkSonner />
                      </div>
                    </SubCategorySidebarProvider>
                  </CategorySidebarProvider>
                </SidebarProvider>
              </TooltipProvider>
            </JotaiProvider>
          </NuqsAdapter>
        </QueryClientProvider>
      </LocaleProvider>
    </DX>
  )
}

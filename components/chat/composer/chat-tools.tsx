import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PackageOpen, BotMessageSquare, Rss, CircleSlash } from "lucide-react"

export function ChatTools() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size={"icon"} variant="outline" className="!bg-background text-muted-foreground hover:text-primary hover:bg-secondary">
                    <PackageOpen />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-58 text-xs" align="start">
                Coming Soon...
                {/* <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <BotMessageSquare className="mr-2 size-3.5" />
                            <span>MCP</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>Model A</DropdownMenuItem>
                                <DropdownMenuItem>Model B</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Compare Models</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Rss className="mr-2 size-3.5" />
                            <span>Methods</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>Method 1</DropdownMenuItem>
                                <DropdownMenuItem>Method 2</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <CircleSlash className="mr-2 size-3.5" />
                    <span>Coming Soon...</span>
                    <DropdownMenuShortcut>⇧⌘C</DropdownMenuShortcut>
                </DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

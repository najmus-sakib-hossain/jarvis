import { Download, Share2, EllipsisVertical } from "lucide-react"
import * as React from "react"
import {
  Bell,
  FileText,
  LineChart,
  Star,
  Trash2,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/layout/sidebar/actions-sidebar"

export function MoreActions({ content }: { content: string }) {
  const [open, setOpen] = React.useState(false)

  const handleAction = (action: string) => {
    console.log(`Action clicked: ${action}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="hover:bg-muted rounded-full p-1.5 transition-colors">
          <EllipsisVertical className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="shadown-none mt-2 w-56 border-none p-0" 
        align="end"
        side="top"
      >
        <nav className="bg-popover max-h-[300px] overflow-y-auto rounded-md border p-2">
          {data.map((group, groupIndex) => (
            <div key={groupIndex} className="border-b py-1 first:pt-0 last:border-none last:pb-0">
              {group.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => handleAction(item.label)}
                  className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm"
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </PopoverContent>
    </Popover>
  )
}

const data = [
  [
    {
      label: "Save to Favorites",
      icon: Star,
    },
    {
      label: "Share Response",
      icon: Share2,
    }
  ],
  [
    {
      label: "Download as PDF",
      icon: FileText,
    },
    {
      label: "Download as Text",
      icon: Download,
    }
  ],
  [
    {
      label: "View Analytics",
      icon: LineChart,
    },
    {
      label: "Report Issue",
      icon: Bell,
    }
  ],
  [
    {
      label: "Delete Response",
      icon: Trash2,
    }
  ]
]

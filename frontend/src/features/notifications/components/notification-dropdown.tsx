import { useNavigate } from "react-router-dom"
import { Bell, CheckCheck } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { NotificationBell } from "./notification-bell"
import { NotificationItem } from "./notification-item"
import { useNotifications, useMarkAsRead, useMarkAllRead } from "../hooks"
import { useState } from "react"

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data, isLoading } = useNotifications({ page: 1, pageSize: 10 })
  const markAsRead = useMarkAsRead()
  const markAllRead = useMarkAllRead()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <NotificationBell onClick={() => setOpen(!open)} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-xs"
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck className="mr-1 size-3" />
            Mark all read
          </Button>
        </div>
        <Separator />
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto mb-2 size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={(id) => markAsRead.mutate(id)}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              navigate("/notifications")
              setOpen(false)
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

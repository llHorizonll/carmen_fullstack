import { useState } from "react"
import { Bell, CheckCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem } from "../components/notification-item"
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllRead,
  useDeleteNotification,
} from "../hooks"
import type { NotificationType } from "../types"

export function NotificationListPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [readFilter, setReadFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useNotifications({
    type: typeFilter === "all" ? undefined : (Number(typeFilter) as NotificationType),
    isRead: readFilter === "all" ? undefined : readFilter === "read",
    page,
    pageSize: 20,
  })

  const markAsRead = useMarkAsRead()
  const markAllRead = useMarkAllRead()
  const deleteNotification = useDeleteNotification()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            View and manage your notifications
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
        >
          <CheckCheck className="mr-2 size-4" />
          Mark all as read
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="1">Approval</SelectItem>
            <SelectItem value="2">Alert</SelectItem>
            <SelectItem value="3">System</SelectItem>
            <SelectItem value="4">Report</SelectItem>
            <SelectItem value="5">User</SelectItem>
          </SelectContent>
        </Select>

        <Select value={readFilter} onValueChange={(v) => { setReadFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notification list */}
      <div className="rounded-md border bg-background">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto mb-3 size-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          <ScrollArea>
            <div className="divide-y">
              {data.items.map((notification) => (
                <div key={notification.id} className="flex items-start">
                  <div className="flex-1">
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={(id) => markAsRead.mutate(id)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-3 mr-2 shrink-0 size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteNotification.mutate(notification.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, data.totalCount)} of{" "}
            {data.totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

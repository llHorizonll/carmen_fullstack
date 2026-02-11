import { useNavigate } from "react-router-dom"
import { Bell, CheckCircle, AlertTriangle, Info, FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationDto, NotificationType } from "../types"

const typeIcons: Record<NotificationType, React.ElementType> = {
  1: CheckCircle, // Approval
  2: AlertTriangle, // Alert
  3: Info, // System
  4: FileText, // Report
  5: User, // User
}

const typeColors: Record<NotificationType, string> = {
  1: "text-blue-500",
  2: "text-amber-500",
  3: "text-purple-500",
  4: "text-green-500",
  5: "text-gray-500",
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

type NotificationItemProps = {
  notification: NotificationDto
  onMarkAsRead?: (id: string) => void
  onClose?: () => void
}

export function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
  const navigate = useNavigate()
  const Icon = typeIcons[notification.type] || Bell

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      onClose?.()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left px-4 py-3 hover:bg-accent transition-colors flex gap-3",
        !notification.isRead && "bg-accent/50"
      )}
    >
      <div className={cn("mt-0.5 shrink-0", typeColors[notification.type])}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.isRead && "font-medium")}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="mt-2 shrink-0">
          <div className="size-2 rounded-full bg-primary" />
        </div>
      )}
    </button>
  )
}

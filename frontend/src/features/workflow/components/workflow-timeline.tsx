import { CheckCircle2, XCircle, ArrowRight, Clock, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkflowHistoryDto, WorkflowStepAction } from "../types"
import { WorkflowStepActionLabels } from "../types"

interface WorkflowTimelineProps {
  history: WorkflowHistoryDto[]
  currentStepName?: string
  className?: string
}

const actionIcons: Record<WorkflowStepAction, React.ElementType> = {
  1: CheckCircle2,
  2: XCircle,
  3: UserCheck,
  4: ArrowRight,
}

const actionColors: Record<WorkflowStepAction, string> = {
  1: "text-green-600",
  2: "text-red-600",
  3: "text-blue-600",
  4: "text-orange-600",
}

export function WorkflowTimeline({ history, currentStepName, className }: WorkflowTimelineProps) {
  if (history.length === 0 && !currentStepName) return null

  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="text-sm font-semibold">Approval Timeline</h4>
      <div className="relative space-y-0">
        {history.map((item, index) => {
          const Icon = actionIcons[item.action]
          const color = actionColors[item.action]
          const isLast = index === history.length - 1 && !currentStepName

          return (
            <div key={item.id} className="flex gap-3 pb-4">
              <div className="flex flex-col items-center">
                <Icon className={cn("size-5 shrink-0", color)} />
                {!isLast && <div className="mt-1 h-full w-px bg-border" />}
              </div>
              <div className="flex-1 -mt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.stepName}</span>
                  <span className={cn("text-xs font-medium", color)}>
                    {WorkflowStepActionLabels[item.action]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  by {item.actionByUserName ?? "Unknown"} &middot;{" "}
                  {new Date(item.actionAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {item.comment && (
                  <p className="mt-1 text-xs text-muted-foreground italic">"{item.comment}"</p>
                )}
              </div>
            </div>
          )
        })}

        {currentStepName && (
          <div className="flex gap-3 pb-4">
            <div className="flex flex-col items-center">
              <Clock className="size-5 shrink-0 text-yellow-600 animate-pulse" />
            </div>
            <div className="flex-1 -mt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{currentStepName}</span>
                <span className="text-xs font-medium text-yellow-600">Pending</span>
              </div>
              <p className="text-xs text-muted-foreground">Waiting for approval</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReportBuilderStore } from "@/stores/report-builder-store"
import { OutputFormat, PageOrientation } from "../../types"

interface TemplateSaveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
  isSaving: boolean
}

export function TemplateSaveDialog({ open, onOpenChange, onSave, isSaving }: TemplateSaveDialogProps) {
  const {
    templateName,
    templateDescription,
    isPublic,
    defaultOutputFormat,
    pageOrientation,
    setTemplateName,
    setTemplateDescription,
    setIsPublic,
    setDefaultOutputFormat,
    setPageOrientation,
    columns,
  } = useReportBuilderStore()

  const canSave = templateName.trim().length > 0 && columns.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Report Template</DialogTitle>
          <DialogDescription>
            Save your report configuration as a reusable template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name *</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Monthly Expense Report"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateDescription">Description</Label>
            <Textarea
              id="templateDescription"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Brief description of this report..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Format</Label>
              <Select
                value={String(defaultOutputFormat)}
                onValueChange={(val) => setDefaultOutputFormat(Number(val) as OutputFormat)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(OutputFormat.Pdf)}>PDF</SelectItem>
                  <SelectItem value={String(OutputFormat.Excel)}>Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Page Orientation</Label>
              <Select
                value={String(pageOrientation)}
                onValueChange={(val) => setPageOrientation(Number(val) as PageOrientation)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(PageOrientation.Portrait)}>Portrait</SelectItem>
                  <SelectItem value={String(PageOrientation.Landscape)}>Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="isPublic">Make this template public (visible to all users)</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!canSave || isSaving}>
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

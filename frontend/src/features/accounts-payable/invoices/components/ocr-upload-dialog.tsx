import { useState, useRef } from "react"
import { Scan, Upload, FileImage, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"
import type { OcrExtractedInvoiceDto } from "../types"

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

interface OcrUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExtracted: (data: OcrExtractedInvoiceDto) => void
}

export function OcrUploadDialog({ open, onOpenChange, onExtracted }: OcrUploadDialogProps) {
  const tenantId = useTenantId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(`File type '${ext}' is not supported. Allowed: JPG, PNG, PDF.`)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds the 10 MB limit.")
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await apiClient.postFormData<OcrExtractedInvoiceDto>(
        `/v1/tenants/${tenantId}/ap/invoices/ocr/upload`,
        formData
      )

      onExtracted(response.data)
      onOpenChange(false)
      setSelectedFile(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "OCR processing failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (isProcessing) return
    onOpenChange(false)
    setSelectedFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="size-5" />
            OCR Invoice Upload
          </DialogTitle>
          <DialogDescription>
            Upload an invoice image or PDF to extract data automatically using AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <>
                <FileImage className="size-10 text-primary mb-2" />
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <Upload className="size-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to select a file</p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, or PDF (max 10 MB)
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={handleFileSelect}
          />

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Processing invoice with AI... This may take a moment.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Scan className="mr-2 size-4" />
                Extract Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

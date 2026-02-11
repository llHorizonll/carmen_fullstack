import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { OcrExtractedInvoiceDto } from "../types"

interface OcrReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: OcrExtractedInvoiceDto | null
}

export function OcrReviewDialog({ open, onOpenChange, data }: OcrReviewDialogProps) {
  const navigate = useNavigate()
  const [vendorName, setVendorName] = useState(data?.vendorName ?? "")
  const [invoiceNumber, setInvoiceNumber] = useState(data?.invoiceNumber ?? "")
  const [invoiceDate, setInvoiceDate] = useState(
    data?.invoiceDate ? new Date(data.invoiceDate).toISOString().split("T")[0] : ""
  )
  const [dueDate, setDueDate] = useState(
    data?.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : ""
  )

  // Update local state when data changes
  if (data && vendorName === "" && data.vendorName) {
    setVendorName(data.vendorName)
    setInvoiceNumber(data.invoiceNumber ?? "")
    setInvoiceDate(data.invoiceDate ? new Date(data.invoiceDate).toISOString().split("T")[0] : "")
    setDueDate(data.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : "")
  }

  if (!data) return null

  const confidencePercent = Math.round(data.confidence * 100)
  const isHighConfidence = data.confidence >= 0.8
  const isMediumConfidence = data.confidence >= 0.5 && data.confidence < 0.8

  const handleProceed = () => {
    // Navigate to the create invoice form with pre-filled data from OCR
    const ocrData = {
      vendorName,
      invoiceNumber,
      invoiceDate,
      dueDate,
      currencyCode: data.currencyCode,
      totalAmount: data.totalAmount,
      lines: data.lines,
    }

    // Store OCR data in sessionStorage for the form to pick up
    sessionStorage.setItem("ocr-invoice-data", JSON.stringify(ocrData))
    onOpenChange(false)
    navigate("/ap/invoices/new?from=ocr")
  }

  const handleClose = () => {
    onOpenChange(false)
    setVendorName("")
    setInvoiceNumber("")
    setInvoiceDate("")
    setDueDate("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            OCR Results Review
            <Badge
              variant={isHighConfidence ? "default" : isMediumConfidence ? "secondary" : "destructive"}
            >
              {isHighConfidence ? (
                <CheckCircle2 className="mr-1 size-3" />
              ) : (
                <AlertTriangle className="mr-1 size-3" />
              )}
              {confidencePercent}% confidence
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review and correct the extracted data before creating the invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Editable fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ocr-vendor">Vendor Name</Label>
              <Input
                id="ocr-vendor"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Vendor name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ocr-invoice-number">Invoice Number</Label>
              <Input
                id="ocr-invoice-number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Invoice number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ocr-invoice-date">Invoice Date</Label>
              <Input
                id="ocr-invoice-date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ocr-due-date">Due Date</Label>
              <Input
                id="ocr-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 rounded-md border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Subtotal</p>
              <p className="font-mono font-medium">
                {formatCurrency(data.subTotal, data.currencyCode)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tax</p>
              <p className="font-mono font-medium">
                {formatCurrency(data.taxAmount, data.currencyCode)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-mono font-bold text-lg">
                {formatCurrency(data.totalAmount, data.currencyCode)}
              </p>
            </div>
          </div>

          {/* Line items */}
          {data.lines.length > 0 && (
            <div>
              <Label className="mb-2 block">Line Items ({data.lines.length})</Label>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.lines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>{line.description || "-"}</TableCell>
                        <TableCell className="text-right font-mono">
                          {line.quantity}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(line.unitPrice, data.currencyCode)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(line.amount, data.currencyCode)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleProceed}>
            <CheckCircle2 className="mr-2 size-4" />
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

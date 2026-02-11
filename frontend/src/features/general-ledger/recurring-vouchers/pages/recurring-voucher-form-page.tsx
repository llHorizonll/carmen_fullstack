import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Plus, Trash2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  useRecurringVoucher,
  useCreateRecurringVoucher,
  useUpdateRecurringVoucher,
} from "../hooks"
import { useAccountLookup } from "@/features/general-ledger/accounts"
import type {
  RecurringFrequency,
  CreateRecurringVoucherLineRequest,
} from "../types"
import { RecurringFrequencyLabels } from "../types"

interface LineItem {
  id?: string
  accountId: string
  debitAmount: number
  creditAmount: number
  description: string
  reference: string
}

export function RecurringVoucherFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { data: existingVoucher, isLoading: loadingVoucher } = useRecurringVoucher(id)
  const { data: accounts } = useAccountLookup(undefined, true)
  const createMutation = useCreateRecurringVoucher()
  const updateMutation = useUpdateRecurringVoucher()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState<RecurringFrequency>(1)
  const [customIntervalDays, setCustomIntervalDays] = useState<number>(30)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currencyCode, setCurrencyCode] = useState("USD")
  const [exchangeRate, setExchangeRate] = useState(1)
  const [reference, setReference] = useState("")
  const [lines, setLines] = useState<LineItem[]>([
    { accountId: "", debitAmount: 0, creditAmount: 0, description: "", reference: "" },
    { accountId: "", debitAmount: 0, creditAmount: 0, description: "", reference: "" },
  ])

  useEffect(() => {
    if (existingVoucher) {
      setName(existingVoucher.name)
      setDescription(existingVoucher.description || "")
      setFrequency(existingVoucher.frequency)
      setCustomIntervalDays(existingVoucher.customIntervalDays || 30)
      setStartDate(existingVoucher.startDate.split("T")[0])
      setEndDate(existingVoucher.endDate ? existingVoucher.endDate.split("T")[0] : "")
      setCurrencyCode(existingVoucher.currencyCode)
      setExchangeRate(existingVoucher.exchangeRate)
      setReference(existingVoucher.reference || "")
      setLines(
        existingVoucher.lines.map((l) => ({
          id: l.id,
          accountId: l.accountId,
          debitAmount: l.debitAmount,
          creditAmount: l.creditAmount,
          description: l.description || "",
          reference: l.reference || "",
        }))
      )
    }
  }, [existingVoucher])

  const totalDebit = lines.reduce((sum, l) => sum + (l.debitAmount || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + (l.creditAmount || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const addLine = () => {
    setLines([
      ...lines,
      { accountId: "", debitAmount: 0, creditAmount: 0, description: "", reference: "" },
    ])
  }

  const removeLine = (index: number) => {
    if (lines.length <= 2) return
    setLines(lines.filter((_, i) => i !== index))
  }

  const updateLine = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lines]
    updated[index] = { ...updated[index], [field]: value }
    setLines(updated)
  }

  const handleSubmit = () => {
    if (!name || !startDate || !isBalanced) return

    const lineRequests: CreateRecurringVoucherLineRequest[] = lines
      .filter((l) => l.accountId && (l.debitAmount > 0 || l.creditAmount > 0))
      .map((l) => ({
        accountId: l.accountId,
        debitAmount: l.debitAmount || 0,
        creditAmount: l.creditAmount || 0,
        description: l.description || undefined,
        reference: l.reference || undefined,
      }))

    if (lineRequests.length < 2) return

    const payload = {
      name,
      description: description || undefined,
      frequency,
      customIntervalDays: frequency === 99 ? customIntervalDays : undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      currencyCode,
      exchangeRate,
      reference: reference || undefined,
      lines: lineRequests,
    }

    if (isEditing && id) {
      updateMutation.mutate(
        { id, data: payload },
        { onSuccess: () => navigate("/gl/recurring-vouchers") }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate("/gl/recurring-vouchers"),
      })
    }
  }

  if (isEditing && loadingVoucher) {
    return <div className="p-8 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/gl/recurring-vouchers")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Recurring Voucher" : "New Recurring Voucher"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update recurring voucher template"
              : "Create a template for automatic journal voucher generation"}
          </p>
        </div>
      </div>

      {/* Template Details */}
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>Basic information about the recurring voucher</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Monthly Rent Expense"
              />
            </div>
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Optional reference"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description for generated journal vouchers..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Configure when this template should generate vouchers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Frequency *</Label>
              <Select
                value={String(frequency)}
                onValueChange={(v) => setFrequency(Number(v) as RecurringFrequency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(RecurringFrequencyLabels) as [string, string][]).map(
                    ([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            {frequency === 99 && (
              <div className="space-y-2">
                <Label>Interval (Days)</Label>
                <Input
                  type="number"
                  value={customIntervalDays}
                  onChange={(e) => setCustomIntervalDays(Number(e.target.value))}
                  min={1}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Exchange Rate</Label>
              <Input
                type="number"
                step="0.000001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journal Lines */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Journal Lines</CardTitle>
              <CardDescription>
                Define the debit and credit entries for this template
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addLine}>
              <Plus className="mr-2 size-4" />
              Add Line
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]">#</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="w-[150px]">Debit</TableHead>
                  <TableHead className="w-[150px]">Credit</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[40px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <Select
                        value={line.accountId}
                        onValueChange={(v) => updateLine(index, "accountId", v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select account..." />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts?.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.accountCode} - {account.accountName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={line.debitAmount || ""}
                        onChange={(e) =>
                          updateLine(index, "debitAmount", Number(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={line.creditAmount || ""}
                        onChange={(e) =>
                          updateLine(index, "creditAmount", Number(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(index, "description", e.target.value)}
                        placeholder="Line description..."
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={lines.length <= 2}
                        onClick={() => removeLine(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell colSpan={2} className="text-right">
                    Totals
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {totalDebit.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {totalCredit.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {isBalanced ? (
                      <span className="text-green-600 text-sm">Balanced</span>
                    ) : (
                      <span className="text-red-600 text-sm">
                        Out of balance by {Math.abs(totalDebit - totalCredit).toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={() => navigate("/gl/recurring-vouchers")}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            !name ||
            !startDate ||
            !isBalanced ||
            totalDebit === 0 ||
            createMutation.isPending ||
            updateMutation.isPending
          }
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : isEditing
              ? "Update Template"
              : "Create Template"}
        </Button>
      </div>
    </div>
  )
}


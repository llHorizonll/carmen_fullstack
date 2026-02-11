import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  usePaymentTerm,
  useCreatePaymentTerm,
  useUpdatePaymentTerm,
} from "../hooks"

// Form validation schema
const paymentTermFormSchema = z.object({
  termCode: z
    .string()
    .min(1, "Term code is required")
    .max(20, "Term code must be 20 characters or less")
    .regex(
      /^[A-Z0-9_-]+$/i,
      "Term code must contain only letters, numbers, underscores, and hyphens"
    ),
  termName: z
    .string()
    .min(1, "Term name is required")
    .max(100, "Term name must be 100 characters or less"),
  termNameLocal: z.string().max(100).optional().nullable(),
  dueDays: z
    .number()
    .int()
    .min(0, "Due days must be 0 or greater")
    .max(365, "Due days must be 365 or less"),
  discountPercent: z
    .number()
    .min(0, "Discount percent must be 0 or greater")
    .max(100, "Discount percent must be 100 or less")
    .optional()
    .nullable(),
  discountDays: z
    .number()
    .int()
    .min(0, "Discount days must be 0 or greater")
    .max(365, "Discount days must be 365 or less")
    .optional()
    .nullable(),
  description: z.string().max(500).optional().nullable(),
  isDefault: z.boolean(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
})

type PaymentTermFormValues = z.infer<typeof paymentTermFormSchema>

export function PaymentTermFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const { data: paymentTerm, isLoading: isLoadingPaymentTerm } = usePaymentTerm(id)
  const createPaymentTerm = useCreatePaymentTerm()
  const updatePaymentTerm = useUpdatePaymentTerm()

  const form = useForm<PaymentTermFormValues>({
    resolver: zodResolver(paymentTermFormSchema),
    defaultValues: {
      termCode: "",
      termName: "",
      termNameLocal: "",
      dueDays: 30,
      discountPercent: null,
      discountDays: null,
      description: "",
      isDefault: false,
      sortOrder: 0,
      isActive: true,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (paymentTerm && isEdit) {
      form.reset({
        termCode: paymentTerm.termCode,
        termName: paymentTerm.termName,
        termNameLocal: paymentTerm.termNameLocal ?? "",
        dueDays: paymentTerm.dueDays,
        discountPercent: paymentTerm.discountPercent ?? null,
        discountDays: paymentTerm.discountDays ?? null,
        description: paymentTerm.description ?? "",
        isDefault: paymentTerm.isDefault,
        sortOrder: paymentTerm.sortOrder,
        isActive: paymentTerm.isActive,
      })
    }
  }, [paymentTerm, isEdit, form])

  const onSubmit = async (data: PaymentTermFormValues) => {
    try {
      if (isEdit && id) {
        await updatePaymentTerm.mutateAsync({
          id,
          data: {
            termName: data.termName,
            termNameLocal: data.termNameLocal || undefined,
            dueDays: data.dueDays,
            discountPercent: data.discountPercent ?? undefined,
            discountDays: data.discountDays ?? undefined,
            description: data.description || undefined,
            isDefault: data.isDefault,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
        })
      } else {
        await createPaymentTerm.mutateAsync({
          termCode: data.termCode.toUpperCase(),
          termName: data.termName,
          termNameLocal: data.termNameLocal || undefined,
          dueDays: data.dueDays,
          discountPercent: data.discountPercent ?? undefined,
          discountDays: data.discountDays ?? undefined,
          description: data.description || undefined,
          isDefault: data.isDefault,
          sortOrder: data.sortOrder,
        })
      }
      navigate("/configuration/payment-terms")
    } catch {
      // Error handling is done in the mutation hooks
    }
  }

  const isSubmitting = createPaymentTerm.isPending || updatePaymentTerm.isPending

  if (isEdit && isLoadingPaymentTerm) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? "Edit Payment Term" : "New Payment Term"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update payment term information"
              : "Create a new payment term for invoices"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Define the payment term code, name, and due days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="termCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., NET30"
                          {...field}
                          disabled={isEdit}
                          className="uppercase"
                          maxLength={20}
                        />
                      </FormControl>
                      <FormDescription>
                        Unique code for this payment term
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Days *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="365"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="w-32"
                        />
                      </FormControl>
                      <FormDescription>
                        Number of days until payment is due
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="termName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Net 30 Days" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="termNameLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Term name in local language"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional description of the payment term..."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Early Payment Discount</CardTitle>
              <CardDescription>
                Optional discount for early payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="discountPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percent</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="e.g., 2.00"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value
                            field.onChange(val === "" ? null : parseFloat(val))
                          }}
                          className="w-32"
                        />
                      </FormControl>
                      <FormDescription>
                        Discount percentage (e.g., 2% discount)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="365"
                          placeholder="e.g., 10"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value
                            field.onChange(val === "" ? null : parseInt(val))
                          }}
                          className="w-32"
                        />
                      </FormControl>
                      <FormDescription>
                        Days within which discount applies (e.g., 2/10 = pay within 10 days)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure display order and default settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="w-32"
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first in lists
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Default Payment Term</FormLabel>
                        <FormDescription>
                          Set as the default payment term for new invoices.
                          Setting this will clear default from other payment terms.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {isEdit && (
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Inactive payment terms will not appear in lookups
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Update Payment Term" : "Create Payment Term"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

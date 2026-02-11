import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  useCurrency,
  useCreateCurrency,
  useUpdateCurrency,
} from "../hooks"

// Form validation schema
const currencyFormSchema = z.object({
  currencyCode: z
    .string()
    .min(1, "Currency code is required")
    .max(3, "Currency code must be 3 characters or less")
    .regex(
      /^[A-Z]+$/i,
      "Currency code must contain only letters"
    ),
  currencyName: z
    .string()
    .min(1, "Currency name is required")
    .max(100, "Currency name must be 100 characters or less"),
  currencyNameLocal: z.string().max(100).optional(),
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol must be 10 characters or less"),
  decimalPlaces: z
    .number()
    .int()
    .min(0, "Decimal places must be 0 or greater")
    .max(4, "Decimal places must be 4 or less"),
  exchangeRate: z
    .number()
    .min(0.00000001, "Exchange rate must be greater than 0"),
  isBaseCurrency: z.boolean(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
})

type CurrencyFormValues = z.infer<typeof currencyFormSchema>

export function CurrencyFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const { data: currency, isLoading: isLoadingCurrency } = useCurrency(id)
  const createCurrency = useCreateCurrency()
  const updateCurrency = useUpdateCurrency()

  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencyFormSchema),
    defaultValues: {
      currencyCode: "",
      currencyName: "",
      currencyNameLocal: "",
      symbol: "",
      decimalPlaces: 2,
      exchangeRate: 1,
      isBaseCurrency: false,
      sortOrder: 0,
      isActive: true,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (currency && isEdit) {
      form.reset({
        currencyCode: currency.currencyCode,
        currencyName: currency.currencyName,
        currencyNameLocal: currency.currencyNameLocal ?? "",
        symbol: currency.symbol,
        decimalPlaces: currency.decimalPlaces,
        exchangeRate: currency.exchangeRate,
        isBaseCurrency: currency.isBaseCurrency,
        sortOrder: currency.sortOrder,
        isActive: currency.isActive,
      })
    }
  }, [currency, isEdit, form])

  const onSubmit = async (data: CurrencyFormValues) => {
    try {
      if (isEdit && id) {
        await updateCurrency.mutateAsync({
          id,
          data: {
            currencyName: data.currencyName,
            currencyNameLocal: data.currencyNameLocal || undefined,
            symbol: data.symbol,
            decimalPlaces: data.decimalPlaces,
            exchangeRate: data.exchangeRate,
            isBaseCurrency: data.isBaseCurrency,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
        })
      } else {
        await createCurrency.mutateAsync({
          currencyCode: data.currencyCode.toUpperCase(),
          currencyName: data.currencyName,
          currencyNameLocal: data.currencyNameLocal || undefined,
          symbol: data.symbol,
          decimalPlaces: data.decimalPlaces,
          exchangeRate: data.exchangeRate,
          isBaseCurrency: data.isBaseCurrency,
          sortOrder: data.sortOrder,
        })
      }
      navigate("/configuration/currencies")
    } catch {
      // Error handling is done in the mutation hooks
    }
  }

  const isSubmitting = createCurrency.isPending || updateCurrency.isPending

  if (isEdit && isLoadingCurrency) {
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
            {isEdit ? "Edit Currency" : "New Currency"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update currency information"
              : "Create a new currency for multi-currency support"}
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
                Define the currency code, name, and symbol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="currencyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., USD"
                          {...field}
                          disabled={isEdit}
                          className="uppercase"
                          maxLength={3}
                        />
                      </FormControl>
                      <FormDescription>
                        ISO 4217 currency code (3 letters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $" {...field} />
                      </FormControl>
                      <FormDescription>
                        Currency symbol for display
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="currencyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., US Dollar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currencyNameLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Currency name in local language"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional name in the local language
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="decimalPlaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decimal Places *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="4"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="w-32"
                        />
                      </FormControl>
                      <FormDescription>
                        Number of decimal places (0-4)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exchangeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange Rate *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          min="0.00000001"
                          placeholder="1.0000"
                          value={field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        Rate relative to base currency
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
                Configure display order and base currency settings
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
                  name="isBaseCurrency"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Base Currency</FormLabel>
                        <FormDescription>
                          Set as the base/functional currency.
                          Exchange rate will be set to 1.0.
                          Setting this will clear base from other currencies.
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
                            Inactive currencies will not appear in lookups
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
              {isEdit ? "Update Currency" : "Create Currency"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

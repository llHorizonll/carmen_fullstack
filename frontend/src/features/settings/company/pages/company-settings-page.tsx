import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Building2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { useTenantSettings, useUpdateTenantSettings } from "../hooks"

// Common timezones
const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (ICT)" },
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho Chi Minh (ICT)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Hong_Kong", label: "Asia/Hong Kong (HKT)" },
  { value: "America/New_York", label: "America/New York (EST)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (PST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
]

// Languages
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "th", label: "Thai (ภาษาไทย)" },
  { value: "vi", label: "Vietnamese (Tiếng Việt)" },
]

// Form validation schema
const companySettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be 200 characters or less"),
  description: z.string().max(500).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  taxId: z.string().max(50).optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  baseCurrency: z.string().min(1, "Base currency is required"),
  defaultLanguage: z.string().min(1, "Default language is required"),
  timeZone: z.string().min(1, "Time zone is required"),
  logoUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
})

type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>

export function CompanySettingsPage() {
  const { data: settings, isLoading } = useTenantSettings()
  const updateSettings = useUpdateTenantSettings()

  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      taxId: "",
      website: "",
      baseCurrency: "USD",
      defaultLanguage: "en",
      timeZone: "UTC",
      logoUrl: "",
    },
  })

  // Populate form when settings loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        name: settings.name,
        description: settings.description ?? "",
        address: settings.address ?? "",
        phone: settings.phone ?? "",
        email: settings.email ?? "",
        taxId: settings.taxId ?? "",
        website: settings.website ?? "",
        baseCurrency: settings.baseCurrency,
        defaultLanguage: settings.defaultLanguage,
        timeZone: settings.timeZone,
        logoUrl: settings.logoUrl ?? "",
      })
    }
  }, [settings, form])

  const onSubmit = async (data: CompanySettingsFormValues) => {
    try {
      await updateSettings.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        taxId: data.taxId || undefined,
        website: data.website || undefined,
        baseCurrency: data.baseCurrency,
        defaultLanguage: data.defaultLanguage,
        timeZone: data.timeZone,
        logoUrl: data.logoUrl || undefined,
      })
    } catch {
      // Error handling is done in the mutation hook
    }
  }

  if (isLoading) {
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
        <div className="rounded-lg bg-primary/10 p-2">
          <Building2 className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization's information and preferences
          </p>
        </div>
        {settings && (
          <Badge variant="outline" className="ml-auto">
            Code: {settings.code}
          </Badge>
        )}
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your company's name and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
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
                        placeholder="Brief description of your company"
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Company address"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+66-2-123-4567"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@company.com"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tax identification number"
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
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.company.com"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Currency, language, and timezone preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="baseCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Currency *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="USD"
                          {...field}
                          className="uppercase"
                          maxLength={3}
                        />
                      </FormControl>
                      <FormDescription>
                        ISO 4217 currency code
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Language *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Zone *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Company logo and visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.png"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to your company logo (recommended: 200x60 pixels)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Subscription Info (Read-only) */}
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  Your subscription status and expiration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge variant={settings.isActive ? "default" : "destructive"}>
                    {settings.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {settings.subscriptionExpiresAt && (
                    <span className="text-sm text-muted-foreground">
                      Expires: {new Date(settings.subscriptionExpiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={!form.formState.isDirty}
            >
              Reset
            </Button>
            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

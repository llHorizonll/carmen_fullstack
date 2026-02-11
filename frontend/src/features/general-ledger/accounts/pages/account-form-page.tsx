import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  useAccount,
  useAccountLookup,
  useCreateAccount,
  useUpdateAccount,
} from "../hooks"
import { AccountType, accountTypeLabels } from "../types"

// Form validation schema
const accountFormSchema = z.object({
  accountCode: z
    .string()
    .min(1, "Account code is required")
    .max(50, "Account code must be 50 characters or less"),
  accountName: z
    .string()
    .min(1, "Account name is required")
    .max(200, "Account name must be 200 characters or less"),
  accountNameLocal: z.string(),
  accountType: z.nativeEnum(AccountType),
  parentAccountId: z.string(),
  isHeader: z.boolean(),
  description: z.string(),
  currencyCode: z.string(),
  allowPosting: z.boolean(),
  isActive: z.boolean(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export function AccountFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const { data: account, isLoading: isLoadingAccount } = useAccount(id)
  const { data: parentAccounts, isLoading: isLoadingParents } = useAccountLookup()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      accountCode: "",
      accountName: "",
      accountNameLocal: "",
      accountType: AccountType.Asset,
      parentAccountId: "",
      isHeader: false,
      description: "",
      currencyCode: "USD",
      allowPosting: true,
      isActive: true,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (account && isEdit) {
      form.reset({
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountNameLocal: account.accountNameLocal ?? "",
        accountType: account.accountType,
        parentAccountId: account.parentAccountId ?? "",
        isHeader: account.isHeader,
        description: account.description ?? "",
        currencyCode: account.currencyCode,
        allowPosting: account.allowPosting,
        isActive: account.isActive,
      })
    }
  }, [account, isEdit, form])

  const onSubmit = async (data: AccountFormValues) => {
    try {
      if (isEdit && id) {
        await updateAccount.mutateAsync({
          id,
          data: {
            accountName: data.accountName,
            accountNameLocal: data.accountNameLocal || undefined,
            parentAccountId: data.parentAccountId === "none" ? undefined : data.parentAccountId || undefined,
            isHeader: data.isHeader,
            description: data.description || undefined,
            currencyCode: data.currencyCode,
            allowPosting: data.allowPosting,
            isActive: data.isActive,
          },
        })
      } else {
        await createAccount.mutateAsync({
          accountCode: data.accountCode,
          accountName: data.accountName,
          accountNameLocal: data.accountNameLocal || undefined,
          accountType: data.accountType,
          parentAccountId: data.parentAccountId === "none" ? undefined : data.parentAccountId || undefined,
          isHeader: data.isHeader,
          description: data.description || undefined,
          currencyCode: data.currencyCode,
          allowPosting: data.allowPosting,
        })
      }
      navigate("/gl/accounts")
    } catch {
      // Error handling is done in the mutation hooks
    }
  }

  const isSubmitting = createAccount.isPending || updateAccount.isPending
  const isLoading = isLoadingAccount || isLoadingParents

  if (isEdit && isLoading) {
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
            {isEdit ? t("generalLedger.accounts.editAccount") : t("generalLedger.accounts.newAccount")}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? t("generalLedger.accounts.editSubtitle")
              : t("generalLedger.accounts.newSubtitle")}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("generalLedger.accounts.form.accountInfo")}</CardTitle>
              <CardDescription>
                {t("generalLedger.accounts.form.accountInfoDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="accountCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("generalLedger.accounts.form.accountCode")} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("generalLedger.accounts.form.accountCodePlaceholder")}
                          {...field}
                          disabled={isEdit}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("generalLedger.accounts.form.accountCodeDesc")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("generalLedger.accounts.form.accountType")} *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                        disabled={isEdit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("generalLedger.accounts.form.selectType")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(accountTypeLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("generalLedger.accounts.form.accountName")} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t("generalLedger.accounts.form.accountNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNameLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("generalLedger.accounts.form.localName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("generalLedger.accounts.form.localNamePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("generalLedger.accounts.form.localNameDesc")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.description")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("generalLedger.accounts.form.descriptionPlaceholder")}
                        {...field}
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
              <CardTitle>{t("generalLedger.accounts.form.hierarchySettings")}</CardTitle>
              <CardDescription>
                {t("generalLedger.accounts.form.hierarchySettingsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="parentAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("generalLedger.accounts.form.parentAccount")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("common.noParent")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">{t("common.noParent")}</SelectItem>
                          {parentAccounts
                            ?.filter((a) => a.id !== id) // Don't show self
                            .map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.accountCode} - {account.accountName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t("generalLedger.accounts.form.parentAccountDesc")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currencyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("generalLedger.accounts.form.currency")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("generalLedger.accounts.form.selectCurrency")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="THB">THB - Thai Baht</SelectItem>
                          <SelectItem value="VND">VND - Vietnamese Dong</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="isHeader"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("generalLedger.accounts.form.headerAccount")}</FormLabel>
                        <FormDescription>
                          {t("generalLedger.accounts.form.headerAccountDesc")}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowPosting"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("generalLedger.accounts.form.allowPosting")}</FormLabel>
                        <FormDescription>
                          {t("generalLedger.accounts.form.allowPostingDesc")}
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
                          <FormLabel>{t("common.active")}</FormLabel>
                          <FormDescription>
                            {t("generalLedger.accounts.form.activeDesc")}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? t("generalLedger.accounts.form.updateAccount") : t("generalLedger.accounts.form.createAccount")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

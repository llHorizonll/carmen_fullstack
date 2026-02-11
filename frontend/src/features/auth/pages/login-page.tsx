import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { BookOpen, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAuthStore } from "@/stores/auth-store"
import { apiClient } from "@/lib/api-client"

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

type TenantSummary = {
  id: string
  code: string
  name: string
  baseCurrency: string
}

type LoginResponse = {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    tenantId?: string
    tenantName?: string
    tenantCode?: string
    roles: string[]
    permissions: string[]
    accessibleTenants: TenantSummary[]
  }
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = React.useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard"

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      // Use postRaw since the auth endpoint returns data directly (not wrapped)
      const { data: response } = await apiClient.postRaw<LoginResponse>("/v1/auth/login", data)

      setAuth(
        {
          id: response.user.id,
          email: response.user.email,
          name: response.user.fullName,
          tenantId: response.user.tenantId,
          tenantName: response.user.tenantName,
          tenantCode: response.user.tenantCode,
          roles: response.user.roles,
          accessibleTenants: response.user.accessibleTenants,
        },
        response.user.permissions,
        response.accessToken,
        response.refreshToken
      )

      toast.success(t("auth.login.success"), {
        description: t("auth.login.successDesc", { firstName: response.user.firstName }),
      })

      navigate(from, { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : t("auth.login.failedDesc")
      toast.error(t("auth.login.failed"), {
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-8 text-primary" />
              <span className="text-2xl font-bold">Carmen</span>
            </div>
          </div>
          <CardTitle className="text-2xl">{t("auth.login.title")}</CardTitle>
          <CardDescription>
            {t("auth.login.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("auth.login.emailPlaceholder")}
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("auth.login.passwordPlaceholder")}
                        autoComplete="current-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("auth.login.signInButton")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Moon, Sun, LogOut, User, Settings, Building2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/stores/auth-store"
import { useThemeStore } from "@/stores/theme-store"
import { LanguageSwitcher } from "./language-switcher"
import { NotificationDropdown } from "@/features/notifications"

export function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout, switchTenant, activeTenantId } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  const hasMultipleTenants = user?.accessibleTenants && user.accessibleTenants.length > 1

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="bg-background border-b h-14 flex items-center justify-between px-4 gap-4">
      {/* Left side - Breadcrumb or page title could go here */}
      <div className="flex-1" />

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Tenant Switcher - only show if user has multiple tenants */}
        {hasMultipleTenants && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Building2 className="size-4" />
                <span className="max-w-37.5 truncate">
                  {user?.tenantName || t("header.selectTenant")}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t("header.switchTenant")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.accessibleTenants.map((tenant) => (
                <DropdownMenuItem
                  key={tenant.id}
                  onClick={() => switchTenant(tenant.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span>{tenant.name}</span>
                    <span className="text-xs text-muted-foreground">{tenant.code}</span>
                  </div>
                  {activeTenantId === tenant.id && (
                    <Check className="size-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Notifications */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="size-5" />
          ) : (
            <Moon className="size-5" />
          )}
        </Button>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="size-8">
                <AvatarImage src="" alt={user?.name || "User"} />
                <AvatarFallback>
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "user@example.com"}
                </p>
                {user?.tenantName && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.tenantName}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 size-4" />
              <span>{t("header.profile")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 size-4" />
              <span>{t("header.settings")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 size-4" />
              <span>{t("header.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

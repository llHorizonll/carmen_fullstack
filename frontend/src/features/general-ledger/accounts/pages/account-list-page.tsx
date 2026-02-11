import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAccounts, useDeleteAccount } from "../hooks";
import { AccountType, type AccountListDto, type AccountQueryParams } from "../types";

export function AccountListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params, setParams] = useState<AccountQueryParams>({
    page: 1,
    pageSize: 20,
    isActive: true,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<AccountListDto | null>(null);

  const { data, isLoading } = useAccounts(params);
  const deleteAccount = useDeleteAccount();

  const handleDelete = async () => {
    if (!accountToDelete) return;
    await deleteAccount.mutateAsync(accountToDelete.id);
    setDeleteDialogOpen(false);
    setAccountToDelete(null);
  };

  const columns: ColumnDef<AccountListDto>[] = [
    {
      accessorKey: "accountCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.accounts.columns.code")} />,
      cell: ({ row }) => <span className="font-mono font-medium">{row.getValue("accountCode")}</span>,
    },
    {
      accessorKey: "accountName",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.accounts.columns.accountName")} />,
      cell: ({ row }) => {
        const level = row.original.level;
        const isHeader = row.original.isHeader;
        const paddingLeft = (level - 1) * 16;
        return (
          <div className={`pl-[${paddingLeft}px]`}>
            <span className={cn(isHeader && "font-semibold")}>{row.getValue("accountName")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "accountType",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.accounts.columns.type")} />,
      cell: ({ row }) => {
        const type = row.getValue("accountType") as AccountType;
        const variants: Record<AccountType, "default" | "secondary" | "destructive" | "outline"> = {
          [AccountType.Asset]: "default",
          [AccountType.Liability]: "secondary",
          [AccountType.Equity]: "outline",
          [AccountType.Revenue]: "default",
          [AccountType.Expense]: "destructive",
        };
        return <Badge variant={variants[type]}>{t(`generalLedger.accounts.types.${AccountType[type].toLowerCase()}`)}</Badge>;
      },
    },
    {
      accessorKey: "isHeader",
      header: t("generalLedger.accounts.columns.header"),
      cell: ({ row }) => (row.getValue("isHeader") ? <Badge variant="outline">{t("common.header")}</Badge> : null),
    },
    {
      accessorKey: "allowPosting",
      header: t("generalLedger.accounts.columns.posting"),
      cell: ({ row }) =>
        row.getValue("allowPosting") ? <Badge variant="secondary">{t("common.yes")}</Badge> : <Badge variant="outline">{t("common.no")}</Badge>,
    },
    {
      accessorKey: "isActive",
      header: t("generalLedger.accounts.columns.status"),
      cell: ({ row }) =>
        row.getValue("isActive") ? (
          <Badge variant="default">{t("common.active")}</Badge>
        ) : (
          <Badge variant="destructive">{t("common.inactive")}</Badge>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const account = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/gl/accounts/${account.id}/edit`)}>
                <Pencil className="mr-2 size-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setAccountToDelete(account);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 size-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("generalLedger.accounts.title")}</h1>
          <p className="text-muted-foreground">{t("generalLedger.accounts.subtitle")}</p>
        </div>
        <Button onClick={() => navigate("/gl/accounts/new")}>
          <Plus className="mr-2 size-4" />
          {t("generalLedger.accounts.newAccount")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.accountType?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              accountType: value === "all" ? undefined : (Number(value) as AccountType),
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder={t("generalLedger.accounts.filters.allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("generalLedger.accounts.filters.allTypes")}</SelectItem>
            <SelectItem value={String(AccountType.Asset)}>{t("generalLedger.accounts.types.asset")}</SelectItem>
            <SelectItem value={String(AccountType.Liability)}>{t("generalLedger.accounts.types.liability")}</SelectItem>
            <SelectItem value={String(AccountType.Equity)}>{t("generalLedger.accounts.types.equity")}</SelectItem>
            <SelectItem value={String(AccountType.Revenue)}>{t("generalLedger.accounts.types.revenue")}</SelectItem>
            <SelectItem value={String(AccountType.Expense)}>{t("generalLedger.accounts.types.expense")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.isActive === undefined ? "all" : params.isActive ? "active" : "inactive"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              isActive: value === "all" ? undefined : value === "active",
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder={t("generalLedger.accounts.filters.allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("generalLedger.accounts.filters.allStatus")}</SelectItem>
            <SelectItem value="active">{t("common.active")}</SelectItem>
            <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        searchKey="accountCode"
        searchPlaceholder={t("generalLedger.accounts.filters.searchPlaceholder")}
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/gl/accounts/${row.id}`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("generalLedger.accounts.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("generalLedger.accounts.delete.confirm", { accountCode: accountToDelete?.accountCode, accountName: accountToDelete?.accountName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteAccount.isPending}>
              {deleteAccount.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

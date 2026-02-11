import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DataSourceType } from "../../types"
import { useReportBuilderStore } from "@/stores/report-builder-store"

const dataSourceLabels: Record<number, string> = {
  [DataSourceType.GeneralLedger]: "General Ledger",
  [DataSourceType.AccountsPayable]: "Accounts Payable",
  [DataSourceType.AccountsReceivable]: "Accounts Receivable",
  [DataSourceType.AssetManagement]: "Asset Management",
}

export function DataSourceSelector() {
  const { dataSource, setDataSource } = useReportBuilderStore()

  return (
    <div className="space-y-2">
      <Label>Data Source</Label>
      <Select
        value={dataSource !== null ? String(dataSource) : undefined}
        onValueChange={(val) => setDataSource(Number(val) as DataSourceType)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a data source..." />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(dataSourceLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

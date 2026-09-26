import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{detail}</span>
      </CardContent>
    </Card>
  )
}

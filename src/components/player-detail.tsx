import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Player } from "@/types/player"
import { X } from "lucide-react"

const stats: Array<[keyof Pick<Player, "pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical">, string]> = [
  ["pace", "PAC"], ["shooting", "SHO"], ["passing", "PAS"], ["dribbling", "DRI"], ["defending", "DEF"], ["physical", "PHY"]
]

export function PlayerDetail({ player, onClose }: { player: Player | null; onClose: () => void }) {
  if (!player) return null
  return (
    <Card className="sticky top-5">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2"><Badge>{player.position}</Badge><Badge variant="outline">{player.age}歳</Badge></div>
            <CardTitle className="text-xl">{player.name}</CardTitle>
            <CardDescription>{player.club} · {player.nationality}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="閉じる"><X data-icon="inline-start" /></Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">OVR</div><div className="text-3xl font-semibold tabular-nums">{player.overall}</div></div>
          <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">POT</div><div className="text-3xl font-semibold tabular-nums">{player.potential}</div></div>
        </div>
        <Separator />
        <div className="grid grid-cols-3 gap-2">
          {stats.map(([key, label]) => <div key={key} className="rounded-md border p-2 text-center"><div className="text-xs text-muted-foreground">{label}</div><div className="text-lg font-semibold tabular-nums">{player[key]}</div></div>)}
        </div>
        <Separator />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div><dt className="text-muted-foreground">利き足</dt><dd className="font-medium">{player.foot}</dd></div>
          <div><dt className="text-muted-foreground">市場価値</dt><dd className="font-medium">€{player.valueM}M</dd></div>
          <div className="col-span-2"><dt className="text-muted-foreground">サブポジション</dt><dd className="font-medium">{player.secondaryPositions.length ? player.secondaryPositions.join(" / ") : "—"}</dd></div>
        </dl>
      </CardContent>
    </Card>
  )
}

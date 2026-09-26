import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PlayerFace } from "@/components/player-face"
import { cn } from "@/lib/utils"
import type { Player } from "@/types/player"
import { X } from "lucide-react"

const stats: Array<[
  keyof Pick<Player, "pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical">,
  string,
]> = [
  ["pace", "PAC"],
  ["shooting", "SHO"],
  ["passing", "PAS"],
  ["dribbling", "DRI"],
  ["defending", "DEF"],
  ["physical", "PHY"],
]

const eur = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

export function PlayerDetail({
  player,
  onClose,
  className,
}: {
  player: Player | null
  onClose: () => void
  className?: string
}) {
  if (!player) return null

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <PlayerFace
              src={player.faceUrl}
              playerId={player.id}
              name={player.name}
              className="size-16 rounded-lg"
            />
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{player.position}</Badge>
                {player.secondaryPositions.map((position) => (
                  <Badge key={position} variant="outline">{position}</Badge>
                ))}
                <Badge variant="outline">{player.age}歳</Badge>
              </div>
              <CardTitle className="truncate text-xl">{player.name}</CardTitle>
              <CardDescription className="truncate">{player.club} · {player.nationality}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="閉じる">
            <X data-icon="inline-start" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted p-3">
            <div className="text-xs text-muted-foreground">OVR</div>
            <div className="text-3xl font-semibold tabular-nums">{player.overall}</div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <div className="text-xs text-muted-foreground">POT</div>
            <div className="text-3xl font-semibold tabular-nums">{player.potential}</div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-2">
          {stats.map(([key, label]) => (
            <div key={key} className="rounded-md border p-2 text-center">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="text-lg font-semibold tabular-nums">{player[key] ?? "—"}</div>
            </div>
          ))}
        </div>

        <Separator />

        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
          <Info label="フルネーム" value={player.longName} wide />
          <Info label="リーグ" value={player.league || "—"} wide />
          <Info label="利き足" value={player.foot} />
          <Info label="生年月日" value={player.dateOfBirth || "—"} />
          <Info label="身長" value={player.heightCm ? `${player.heightCm} cm` : "—"} />
          <Info label="体重" value={player.weightKg ? `${player.weightKg} kg` : "—"} />
          <Info label="弱い足" value={stars(player.weakFoot)} />
          <Info label="スキルムーブ" value={stars(player.skillMoves)} />
          <Info label="市場価値" value={player.valueEur != null ? eur.format(player.valueEur) : "—"} wide />
          <Info label="週給" value={player.wageEur != null ? eur.format(player.wageEur) : "—"} wide />
          <Info
            label="対応ポジション"
            value={[player.position, ...player.secondaryPositions].join(" / ")}
            wide
          />
        </dl>
      </CardContent>
    </Card>
  )
}

function Info({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "min-w-0 sm:col-span-2" : "min-w-0"}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  )
}

function stars(value: number | null) {
  return value == null ? "—" : `${value} / 5`
}

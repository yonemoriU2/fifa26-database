import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlayerDetail } from "@/components/player-detail"
import { StatCard } from "@/components/stat-card"
import { players } from "@/data/players"
import type { Player, Position } from "@/types/player"
import { ArrowDownAZ, Database, RotateCcw, Search, SlidersHorizontal } from "lucide-react"

const positions: Array<Position | "ALL"> = ["ALL", "GK", "RB", "CB", "LB", "CDM", "CM", "CAM", "RM", "LM", "RW", "LW", "CF", "ST"]
type SortKey = "overall" | "potential" | "age" | "valueM"

export default function App() {
  const [query, setQuery] = useState("")
  const [position, setPosition] = useState<Position | "ALL">("ALL")
  const [age, setAge] = useState<[number, number]>([16, 40])
  const [ovr, setOvr] = useState<[number, number]>([60, 99])
  const [pot, setPot] = useState<[number, number]>([60, 99])
  const [club, setClub] = useState("ALL")
  const [nation, setNation] = useState("ALL")
  const [sortKey, setSortKey] = useState<SortKey>("overall")
  const [selected, setSelected] = useState<Player | null>(null)

  const clubs = useMemo(() => ["ALL", ...Array.from(new Set(players.map((p) => p.club))).sort()], [])
  const nations = useMemo(() => ["ALL", ...Array.from(new Set(players.map((p) => p.nationality))).sort()], [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return players
      .filter((p) => !q || [p.name, p.club, p.nationality].some((v) => v.toLowerCase().includes(q)))
      .filter((p) => position === "ALL" || p.position === position || p.secondaryPositions.includes(position))
      .filter((p) => p.age >= age[0] && p.age <= age[1])
      .filter((p) => p.overall >= ovr[0] && p.overall <= ovr[1])
      .filter((p) => p.potential >= pot[0] && p.potential <= pot[1])
      .filter((p) => club === "ALL" || p.club === club)
      .filter((p) => nation === "ALL" || p.nationality === nation)
      .sort((a, b) => sortKey === "age" ? a.age - b.age : b[sortKey] - a[sortKey])
  }, [query, position, age, ovr, pot, club, nation, sortKey])

  const reset = () => {
    setQuery("")
    setPosition("ALL")
    setAge([16, 40])
    setOvr([60, 99])
    setPot([60, 99])
    setClub("ALL")
    setNation("ALL")
    setSortKey("overall")
    setSelected(null)
  }

  const avgOvr = filtered.length ? Math.round(filtered.reduce((sum, p) => sum + p.overall, 0) / filtered.length) : 0
  const highPotential = filtered.filter((p) => p.potential >= 90).length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Database /></div>
            <div><div className="flex items-center gap-2"><h1 className="font-semibold">FC26 Scout Database</h1><Badge variant="secondary">Prototype</Badge></div><p className="text-xs text-muted-foreground">Career Mode player search</p></div>
          </div>
          <Badge variant="outline">Mock data · {players.length} players</Badge>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-5 lg:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="検索結果" value={filtered.length.toLocaleString()} detail={`${players.length}件中`} />
          <StatCard label="平均OVR" value={String(avgOvr)} detail="現在の絞り込み" />
          <StatCard label="POT 90+" value={String(highPotential)} detail="将来性候補" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><CardTitle className="flex items-center gap-2"><SlidersHorizontal />検索条件</CardTitle><CardDescription>選手名・ポジション・年齢・OVR・POT・クラブ・国籍から絞り込み</CardDescription></div>
              <Button variant="outline" size="sm" onClick={reset}><RotateCcw data-icon="inline-start" />リセット</Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-2 text-sm"><span className="font-medium">選手検索</span><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="名前 / クラブ / 国籍" /></div></label>
              <label className="flex flex-col gap-2 text-sm"><span className="font-medium">ポジション</span><Select value={position} onValueChange={(v) => setPosition(v as Position | "ALL")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{positions.map((p) => <SelectItem key={p} value={p}>{p === "ALL" ? "すべて" : p}</SelectItem>)}</SelectGroup></SelectContent></Select></label>
              <label className="flex flex-col gap-2 text-sm"><span className="font-medium">クラブ</span><Select value={club} onValueChange={setClub}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{clubs.map((c) => <SelectItem key={c} value={c}>{c === "ALL" ? "すべて" : c}</SelectItem>)}</SelectGroup></SelectContent></Select></label>
              <label className="flex flex-col gap-2 text-sm"><span className="font-medium">国籍</span><Select value={nation} onValueChange={setNation}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{nations.map((n) => <SelectItem key={n} value={n}>{n === "ALL" ? "すべて" : n}</SelectItem>)}</SelectGroup></SelectContent></Select></label>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <RangeFilter label="年齢" value={age} min={16} max={40} onChange={setAge} />
              <RangeFilter label="OVR" value={ovr} min={40} max={99} onChange={setOvr} />
              <RangeFilter label="POT" value={pot} min={40} max={99} onChange={setPot} />
            </div>
          </CardContent>
        </Card>

        <div className={selected ? "grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]" : "grid gap-5"}>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><CardTitle>Players</CardTitle><CardDescription>{filtered.length}件の選手</CardDescription></div>
                <div className="flex items-center gap-2"><ArrowDownAZ className="text-muted-foreground" /><Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="overall">OVR 高い順</SelectItem><SelectItem value="potential">POT 高い順</SelectItem><SelectItem value="age">年齢 若い順</SelectItem><SelectItem value="valueM">市場価値 高い順</SelectItem></SelectGroup></SelectContent></Select></div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Player</TableHead><TableHead>POS</TableHead><TableHead className="text-right">AGE</TableHead><TableHead className="text-right">OVR</TableHead><TableHead className="text-right">POT</TableHead><TableHead className="hidden text-right md:table-cell">PAC</TableHead><TableHead className="hidden text-right lg:table-cell">PAS</TableHead><TableHead className="hidden xl:table-cell">Club</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.map((player) => (
                    <TableRow key={player.id} className="cursor-pointer" onClick={() => setSelected(player)} data-state={selected?.id === player.id ? "selected" : undefined}>
                      <TableCell><div className="flex flex-col gap-0.5"><span className="font-medium">{player.name}</span><span className="text-xs text-muted-foreground xl:hidden">{player.club}</span></div></TableCell>
                      <TableCell><Badge variant="outline">{player.position}</Badge></TableCell>
                      <TableCell className="text-right tabular-nums">{player.age}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{player.overall}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{player.potential}</TableCell>
                      <TableCell className="hidden text-right tabular-nums md:table-cell">{player.pace}</TableCell>
                      <TableCell className="hidden text-right tabular-nums lg:table-cell">{player.passing}</TableCell>
                      <TableCell className="hidden text-muted-foreground xl:table-cell">{player.club}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">条件に一致する選手がいません。</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <PlayerDetail player={selected} onClose={() => setSelected(null)} />
        </div>
      </main>
    </div>
  )
}

function RangeFilter({ label, value, min, max, onChange }: { label: string; value: [number, number]; min: number; max: number; onChange: (v: [number, number]) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3 text-sm"><span className="font-medium">{label}</span><span className="font-mono text-xs text-muted-foreground">{value[0]} — {value[1]}</span></div>
      <Slider min={min} max={max} step={1} value={value} onValueChange={(v) => onChange([v[0], v[1]])} minStepsBetweenThumbs={1} />
    </div>
  )
}

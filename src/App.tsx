import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlayerDetail } from "@/components/player-detail"
import { PlayerFace } from "@/components/player-face"
import { StatCard } from "@/components/stat-card"
import { loadPlayers } from "@/data/load-players"
import type { Player, Position } from "@/types/player"
import { ArrowDownAZ, ChevronLeft, ChevronRight, Database, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react"

const positions: Position[] = [
  "GK", "RB", "RWB", "CB", "LB", "LWB", "CDM", "CM", "CAM", "RM", "LM", "RW", "LW", "CF", "ST",
]

type PositionMatchMode = "any" | "all"
type SortKey = "overall" | "potential" | "age" | "valueEur"

const PAGE_SIZE = 100

export default function App() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([])
  const [positionMatchMode, setPositionMatchMode] = useState<PositionMatchMode>("any")
  const [age, setAge] = useState<[number, number]>([15, 45])
  const [ovr, setOvr] = useState<[number, number]>([40, 99])
  const [pot, setPot] = useState<[number, number]>([40, 99])
  const [club, setClub] = useState("ALL")
  const [league, setLeague] = useState("ALL")
  const [nation, setNation] = useState("ALL")
  const [sortKey, setSortKey] = useState<SortKey>("overall")
  const [selected, setSelected] = useState<Player | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    loadPlayers()
      .then((data) => {
        if (cancelled) return
        setPlayers(data)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : "選手データの読み込みに失敗しました。")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const clubs = useMemo(
    () => ["ALL", ...Array.from(new Set(players.map((player) => player.club).filter(Boolean))).sort()],
    [players],
  )
  const leagues = useMemo(
    () => ["ALL", ...Array.from(new Set(players.map((player) => player.league).filter(Boolean))).sort()],
    [players],
  )
  const nations = useMemo(
    () => ["ALL", ...Array.from(new Set(players.map((player) => player.nationality).filter(Boolean))).sort()],
    [players],
  )

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return players
      .filter((player) => {
        if (!normalizedQuery) return true
        return [player.name, player.longName, player.club, player.nationality, player.league]
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      })
      .filter((player) => {
        if (selectedPositions.length === 0) return true

        const availablePositions = new Set<Position>([player.position, ...player.secondaryPositions])

        if (positionMatchMode === "all") {
          return selectedPositions.every((position) => availablePositions.has(position))
        }

        return selectedPositions.some((position) => availablePositions.has(position))
      })
      .filter((player) => player.age >= age[0] && player.age <= age[1])
      .filter((player) => player.overall >= ovr[0] && player.overall <= ovr[1])
      .filter((player) => player.potential >= pot[0] && player.potential <= pot[1])
      .filter((player) => club === "ALL" || player.club === club)
      .filter((player) => league === "ALL" || player.league === league)
      .filter((player) => nation === "ALL" || player.nationality === nation)
      .sort((a, b) => {
        if (sortKey === "age") return a.age - b.age
        if (sortKey === "valueEur") return (b.valueEur ?? -1) - (a.valueEur ?? -1)
        return b[sortKey] - a[sortKey]
      })
  }, [
    players,
    query,
    selectedPositions,
    positionMatchMode,
    age,
    ovr,
    pot,
    club,
    league,
    nation,
    sortKey,
  ])

  useEffect(() => {
    setPage(1)
  }, [query, selectedPositions, positionMatchMode, age, ovr, pot, club, league, nation, sortKey])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pagePlayers = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const reset = () => {
    setQuery("")
    setSelectedPositions([])
    setPositionMatchMode("any")
    setAge([15, 45])
    setOvr([40, 99])
    setPot([40, 99])
    setClub("ALL")
    setLeague("ALL")
    setNation("ALL")
    setSortKey("overall")
    setSelected(null)
    setPage(1)
  }

  const togglePosition = (position: Position) => {
    setSelectedPositions((current) =>
      current.includes(position)
        ? current.filter((item) => item !== position)
        : [...current, position],
    )
  }

  const avgOvr = filtered.length
    ? Math.round(filtered.reduce((sum, player) => sum + player.overall, 0) / filtered.length)
    : 0
  const highPotential = filtered.filter((player) => player.potential >= 90).length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Database />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold">FC26 Scout Database</h1>
                <Badge variant="secondary">FC 26</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Career Mode player search</p>
            </div>
          </div>
          <Badge variant="outline">
            {loading ? "Loading…" : `${players.length.toLocaleString()} players`}
          </Badge>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-5 lg:px-6">
        {loadError && (
          <Card>
            <CardHeader>
              <CardTitle>データ読み込みエラー</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="検索結果" value={loading ? "…" : filtered.length.toLocaleString()} detail={`${players.length.toLocaleString()}件中`} />
          <StatCard label="平均OVR" value={loading ? "…" : String(avgOvr)} detail="現在の絞り込み" />
          <StatCard label="POT 90+" value={loading ? "…" : String(highPotential)} detail="将来性候補" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal />
                  検索条件
                </CardTitle>
                <CardDescription>名前・複数ポジション・年齢・OVR・POT・クラブ・リーグ・国籍から検索</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw data-icon="inline-start" />
                リセット
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-2 text-sm xl:col-span-2">
                <span className="font-medium">選手検索</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="選手名 / クラブ / 国籍 / リーグ"
                  />
                </div>
              </label>
              <FilterSelect label="リーグ" value={league} onChange={setLeague} options={leagues} />
              <FilterSelect label="国籍" value={nation} onChange={setNation} options={nations} />
            </div>

            <PositionFilter
              selected={selectedPositions}
              matchMode={positionMatchMode}
              onToggle={togglePosition}
              onClear={() => setSelectedPositions([])}
              onMatchModeChange={setPositionMatchMode}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FilterSelect label="クラブ" value={club} onChange={setClub} options={clubs} />
              <RangeFilter label="年齢" value={age} min={15} max={45} onChange={setAge} />
              <RangeFilter label="OVR" value={ovr} min={40} max={99} onChange={setOvr} />
              <RangeFilter label="POT" value={pot} min={40} max={99} onChange={setPot} />
            </div>
          </CardContent>
        </Card>

        <div className={selected ? "grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]" : "grid gap-5"}>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Players</CardTitle>
                  <CardDescription>
                    {loading
                      ? "選手データを読み込み中…"
                      : `${filtered.length.toLocaleString()}件 · ${safePage} / ${pageCount} ページ`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDownAZ className="text-muted-foreground" />
                  <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="overall">OVR 高い順</SelectItem>
                        <SelectItem value="potential">POT 高い順</SelectItem>
                        <SelectItem value="age">年齢 若い順</SelectItem>
                        <SelectItem value="valueEur">市場価値 高い順</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>POS</TableHead>
                    <TableHead className="text-right">AGE</TableHead>
                    <TableHead className="text-right">OVR</TableHead>
                    <TableHead className="text-right">POT</TableHead>
                    <TableHead className="hidden text-right md:table-cell">PAC</TableHead>
                    <TableHead className="hidden text-right lg:table-cell">PAS</TableHead>
                    <TableHead className="hidden xl:table-cell">Club</TableHead>
                    <TableHead className="hidden 2xl:table-cell">League</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagePlayers.map((player) => (
                    <TableRow
                      key={player.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(player)}
                      data-state={selected?.id === player.id ? "selected" : undefined}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <PlayerFace
                            src={player.faceUrl}
                            playerId={player.id}
                            name={player.name}
                            className="size-9 rounded-md"
                            loading="lazy"
                          />
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate font-medium">{player.name}</span>
                            <span className="truncate text-xs text-muted-foreground xl:hidden">{player.club}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex max-w-56 flex-wrap gap-1">
                          <Badge>{player.position}</Badge>
                          {player.secondaryPositions.map((position) => (
                            <Badge key={position} variant="outline">{position}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{player.age}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{player.overall}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{player.potential}</TableCell>
                      <TableCell className="hidden text-right tabular-nums md:table-cell">{displayStat(player.pace)}</TableCell>
                      <TableCell className="hidden text-right tabular-nums lg:table-cell">{displayStat(player.passing)}</TableCell>
                      <TableCell className="hidden max-w-48 truncate text-muted-foreground xl:table-cell">{player.club}</TableCell>
                      <TableCell className="hidden max-w-48 truncate text-muted-foreground 2xl:table-cell">{player.league}</TableCell>
                    </TableRow>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        条件に一致する選手がいません。
                      </TableCell>
                    </TableRow>
                  )}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        18,405人の選手データを読み込み中…
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {filtered.length > 0
                    ? `${((safePage - 1) * PAGE_SIZE + 1).toLocaleString()}–${Math.min(safePage * PAGE_SIZE, filtered.length).toLocaleString()} / ${filtered.length.toLocaleString()}`
                    : "0件"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    <ChevronLeft data-icon="inline-start" />
                    前へ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= pageCount}
                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  >
                    次へ
                    <ChevronRight data-icon="inline-end" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <PlayerDetail player={selected} onClose={() => setSelected(null)} />
        </div>
      </main>
    </div>
  )
}

function PositionFilter({
  selected,
  matchMode,
  onToggle,
  onClear,
  onMatchModeChange,
}: {
  selected: Position[]
  matchMode: PositionMatchMode
  onToggle: (position: Position) => void
  onClear: () => void
  onMatchModeChange: (mode: PositionMatchMode) => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">ポジション</div>
          <div className="text-xs text-muted-foreground">
            複数選択できます。未選択の場合は全ポジションを対象にします。
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{selected.length} 選択</Badge>
          {selected.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X data-icon="inline-start" />
              解除
            </Button>
          )}
          <Select value={matchMode} onValueChange={(value) => onMatchModeChange(value as PositionMatchMode)}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="any">いずれかに対応（OR）</SelectItem>
                <SelectItem value="all">すべてに対応（AND）</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="ポジションを選択">
        {positions.map((position) => {
          const isSelected = selected.includes(position)
          return (
            <Button
              key={position}
              type="button"
              size="sm"
              variant={isSelected ? "default" : "outline"}
              aria-pressed={isSelected}
              onClick={() => onToggle(position)}
            >
              {position}
            </Button>
          )
        })}
      </div>

      {selected.length > 1 && (
        <div className="text-xs text-muted-foreground">
          {matchMode === "any"
            ? `「${selected.join(" / ")}」のうち、1つでも対応できる選手を表示しています。`
            : `「${selected.join(" / ")}」のすべてに対応できる選手のみ表示しています。`}
        </div>
      )}
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "ALL" ? "すべて" : option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </label>
  )
}

function RangeFilter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: [number, number]
  min: number
  max: number
  onChange: (value: [number, number]) => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{value[0]} — {value[1]}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={value}
        onValueChange={(next) => onChange([next[0], next[1]])}
        minStepsBetweenThumbs={1}
      />
    </div>
  )
}

function displayStat(value: number | null) {
  return value ?? "—"
}

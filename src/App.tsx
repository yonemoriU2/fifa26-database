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
import { loadPlayers } from "@/data/load-players"
import type { Player, Position } from "@/types/player"
import { ChevronLeft, ChevronRight, Database, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react"

const positionLayout: { position: Position; x: number; y: number }[] = [
  { position: "ST", x: 50, y: 9 },

  { position: "LW", x: 18, y: 22 },
  { position: "CF", x: 50, y: 22 },
  { position: "RW", x: 82, y: 22 },

  { position: "LM", x: 16, y: 39 },
  { position: "CAM", x: 50, y: 37 },
  { position: "RM", x: 84, y: 39 },

  { position: "LWB", x: 11, y: 58 },
  { position: "CM", x: 50, y: 50 },
  { position: "RWB", x: 89, y: 58 },
  { position: "CDM", x: 50, y: 62 },

  { position: "LB", x: 20, y: 76 },
  { position: "CB", x: 50, y: 76 },
  { position: "RB", x: 80, y: 76 },

  { position: "GK", x: 50, y: 91 },
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
  const [showFilters, setShowFilters] = useState(false)

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

  useEffect(() => {
    if (!selected) return

    const compactLayout = window.matchMedia("(max-width: 1279px)")
    if (!compactLayout.matches) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selected])

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
    setShowFilters(false)
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
  const activeFilterCount =
    (selectedPositions.length > 0 ? 1 : 0) +
    (age[0] !== 15 || age[1] !== 45 ? 1 : 0) +
    (ovr[0] !== 40 || ovr[1] !== 99 ? 1 : 0) +
    (pot[0] !== 40 || pot[1] !== 99 ? 1 : 0) +
    (club !== "ALL" ? 1 : 0) +
    (league !== "ALL" ? 1 : 0) +
    (nation !== "ALL" ? 1 : 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2.5 sm:px-4 lg:px-6">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Database />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate font-semibold">FC26 Scout Database</h1>
              <Badge variant="secondary">FC 26</Badge>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block">Career Mode player search</p>
          </div>
          <Badge variant="outline" className="shrink-0">
            {loading ? "…" : players.length.toLocaleString()}
          </Badge>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1600px] flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 lg:px-6">
        {loadError && (
          <Card>
            <CardHeader>
              <CardTitle>データ読み込みエラー</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <section className="flex flex-col gap-2" aria-label="選手検索">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="選手名・クラブ・国籍・リーグ"
                aria-label="選手を検索"
              />
            </div>
            <Button
              type="button"
              variant={activeFilterCount > 0 ? "secondary" : "outline"}
              onClick={() => setShowFilters((current) => !current)}
              aria-expanded={showFilters}
              aria-controls="advanced-filters"
            >
              <SlidersHorizontal data-icon="inline-start" />
              絞り込み{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Button>
          </div>

          {activeFilterCount > 0 && !showFilters && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {activeFilterCount}個の絞り込み条件を適用中
              </p>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw data-icon="inline-start" />
                解除
              </Button>
            </div>
          )}
        </section>

        <Card id="advanced-filters" className={showFilters ? "" : "hidden md:block"}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle>絞り込み</CardTitle>
                <CardDescription>ポジション・年齢・OVR・POT・クラブ・リーグ・国籍</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw data-icon="inline-start" />
                リセット
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <PositionFilter
              selected={selectedPositions}
              matchMode={positionMatchMode}
              onToggle={togglePosition}
              onClear={() => setSelectedPositions([])}
              onMatchModeChange={setPositionMatchMode}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FilterSelect label="クラブ" value={club} onChange={setClub} options={clubs} />
              <FilterSelect label="リーグ" value={league} onChange={setLeague} options={leagues} />
              <FilterSelect label="国籍" value={nation} onChange={setNation} options={nations} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <RangeFilter label="年齢" value={age} min={15} max={45} onChange={setAge} />
              <RangeFilter label="OVR" value={ovr} min={40} max={99} onChange={setOvr} />
              <RangeFilter label="POT" value={pot} min={40} max={99} onChange={setPot} />
            </div>
          </CardContent>
        </Card>

        <div className={selected ? "grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]" : "grid gap-5"}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle>
                    {loading ? "Players" : `${filtered.length.toLocaleString()} players`}
                  </CardTitle>
                  <CardDescription>
                    {loading
                      ? "選手データを読み込み中…"
                      : `平均OVR ${avgOvr} · POT90+ ${highPotential} · ${safePage}/${pageCount}ページ`}
                  </CardDescription>
                </div>
                <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
                  <SelectTrigger className="w-36 shrink-0 sm:w-44" aria-label="並び順">
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
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="hidden sm:table-cell">POS</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">AGE</TableHead>
                    <TableHead className="text-right">OVR</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">POT</TableHead>
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
                          <div className="flex min-w-0 flex-col gap-1">
                            <span className="truncate font-medium">{player.name}</span>
                            <span className="truncate text-xs text-muted-foreground xl:hidden">{player.club}</span>
                            <div className="flex min-w-0 flex-wrap items-center gap-1 sm:hidden">
                              <Badge>{player.position}</Badge>
                              <span className="truncate text-xs text-muted-foreground">
                                {player.age}歳 · POT {player.potential}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex max-w-56 flex-wrap gap-1">
                          <Badge>{player.position}</Badge>
                          {player.secondaryPositions.map((position) => (
                            <Badge key={position} variant="outline">{position}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-right tabular-nums sm:table-cell">{player.age}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{player.overall}</TableCell>
                      <TableCell className="hidden text-right font-semibold tabular-nums sm:table-cell">{player.potential}</TableCell>
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

              <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-center text-xs text-muted-foreground sm:text-left">
                  {filtered.length > 0
                    ? `${((safePage - 1) * PAGE_SIZE + 1).toLocaleString()}–${Math.min(safePage * PAGE_SIZE, filtered.length).toLocaleString()} / ${filtered.length.toLocaleString()}`
                    : "0件"}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <Button
                    className="w-full sm:w-auto"
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    <ChevronLeft data-icon="inline-start" />
                    前へ
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
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

          <div className="hidden xl:block">
            <PlayerDetail
              player={selected}
              onClose={() => setSelected(null)}
              className="sticky top-5"
            />
          </div>
        </div>

        {selected && (
          <div
            className="fixed inset-0 overflow-y-auto overscroll-contain bg-background p-3 xl:hidden sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.name}の選手詳細`}
          >
            <PlayerDetail
              player={selected}
              onClose={() => setSelected(null)}
              className="min-h-[calc(100vh-1.5rem)] sm:min-h-0"
            />
          </div>
        )}
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
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
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
            <SelectTrigger className="w-full sm:w-52">
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

      <div className="flex flex-col gap-2">
        <div
          className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-xl border bg-muted"
          role="group"
          aria-label="ピッチ上からポジションを選択"
        >
          <div className="pointer-events-none absolute inset-4 rounded-lg border border-muted-foreground/40" />
          <div className="pointer-events-none absolute left-4 right-4 top-1/2 border-t border-muted-foreground/40" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-muted-foreground/40" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/50" />

          <div className="pointer-events-none absolute left-1/2 top-4 h-16 w-32 -translate-x-1/2 rounded-b-lg border-x border-b border-muted-foreground/40" />
          <div className="pointer-events-none absolute left-1/2 top-4 h-8 w-16 -translate-x-1/2 rounded-b-md border-x border-b border-muted-foreground/40" />
          <div className="pointer-events-none absolute bottom-4 left-1/2 h-16 w-32 -translate-x-1/2 rounded-t-lg border-x border-t border-muted-foreground/40" />
          <div className="pointer-events-none absolute bottom-4 left-1/2 h-8 w-16 -translate-x-1/2 rounded-t-md border-x border-t border-muted-foreground/40" />

          {positionLayout.map(({ position, x, y }) => {
            const isSelected = selected.includes(position)
            return (
              <Button
                key={position}
                type="button"
                size="sm"
                variant={isSelected ? "default" : "outline"}
                className="absolute min-w-12 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-pressed={isSelected}
                aria-label={`${position}${isSelected ? " 選択中" : ""}`}
                onClick={() => onToggle(position)}
              >
                {position}
              </Button>
            )
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          ピッチ上のポジションをタップして複数選択できます。
        </p>
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

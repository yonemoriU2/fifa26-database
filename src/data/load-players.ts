import type { Player, Position } from "@/types/player"

type CompactPlayer = {
  id: number
  n: string
  ln: string
  p: string[]
  o: number
  pt: number
  a: number
  dob: string
  v: number | null
  w: number | null
  h: number | null
  wt: number | null
  l: string
  c: string
  nat: string
  f: "Left" | "Right"
  wf: number | null
  sm: number | null
  pac: number | null
  sho: number | null
  pas: number | null
  dri: number | null
  def: number | null
  phy: number | null
  face: string
}

const CHUNK_COUNT = 13

function normalizePlayer(player: CompactPlayer): Player {
  const positions = player.p as Position[]
  return {
    id: player.id,
    name: player.n,
    longName: player.ln,
    club: player.c,
    league: player.l,
    nationality: player.nat,
    position: positions[0] ?? "CM",
    secondaryPositions: positions.slice(1),
    age: player.a,
    dateOfBirth: player.dob,
    overall: player.o,
    potential: player.pt,
    pace: player.pac,
    shooting: player.sho,
    passing: player.pas,
    dribbling: player.dri,
    defending: player.def,
    physical: player.phy,
    foot: player.f,
    weakFoot: player.wf,
    skillMoves: player.sm,
    valueEur: player.v,
    wageEur: player.w,
    heightCm: player.h,
    weightKg: player.wt,
    faceUrl: player.face,
  }
}

export async function loadPlayers(): Promise<Player[]> {
  const chunks = await Promise.all(
    Array.from({ length: CHUNK_COUNT }, async (_, index) => {
      const file = `data/players-${String(index).padStart(2, "0")}.json`
      const response = await fetch(file)
      if (!response.ok) {
        throw new Error(`Failed to load ${file}: ${response.status}`)
      }
      return (await response.json()) as CompactPlayer[]
    }),
  )

  return chunks.flat().map(normalizePlayer)
}

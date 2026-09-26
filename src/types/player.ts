export type Position =
  | "GK" | "RB" | "RWB" | "CB" | "LB" | "LWB"
  | "CDM" | "CM" | "CAM" | "RM" | "LM" | "RW" | "LW" | "CF" | "ST"

export type Player = {
  id: number
  name: string
  longName: string
  club: string
  league: string
  nationality: string
  position: Position
  secondaryPositions: Position[]
  age: number
  dateOfBirth: string
  overall: number
  potential: number
  pace: number | null
  shooting: number | null
  passing: number | null
  dribbling: number | null
  defending: number | null
  physical: number | null
  foot: "Left" | "Right"
  weakFoot: number | null
  skillMoves: number | null
  valueEur: number | null
  wageEur: number | null
  heightCm: number | null
  weightKg: number | null
  faceUrl: string
}

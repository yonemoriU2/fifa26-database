export type Position =
  | "GK" | "RB" | "CB" | "LB" | "CDM" | "CM" | "CAM" | "RM" | "LM" | "RW" | "LW" | "CF" | "ST"

export type Player = {
  id: number
  name: string
  club: string
  nationality: string
  position: Position
  secondaryPositions: Position[]
  age: number
  overall: number
  potential: number
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  foot: "Left" | "Right"
  valueM: number
}

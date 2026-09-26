import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

export function PlayerFace({
  src,
  playerId,
  name,
  className,
  loading,
}: {
  src: string
  playerId?: number
  name: string
  className?: string
  loading?: "eager" | "lazy"
}) {
  const sources = useMemo(() => {
    const candidates = [
      src,
      playerId
        ? `https://fco.dn.nexoncdn.co.kr/live/externalAssets/common/players/p${playerId}.png`
        : "",
    ]

    return Array.from(new Set(candidates.filter(Boolean)))
  }, [playerId, src])

  const [sourceIndex, setSourceIndex] = useState(0)

  useEffect(() => {
    setSourceIndex(0)
  }, [sources])

  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "?"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
  }, [name])

  const currentSrc = sources[sourceIndex] ?? ""

  if (!currentSrc) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-muted text-xs font-semibold text-muted-foreground",
          className,
        )}
        aria-label={`${name}の画像なし`}
        title="画像を取得できませんでした"
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={currentSrc}
      alt={`${name}の選手画像`}
      className={cn("shrink-0 bg-muted object-cover", className)}
      loading={loading}
      decoding="async"
      onError={() => setSourceIndex((index) => index + 1)}
    />
  )
}

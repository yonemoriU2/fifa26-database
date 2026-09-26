import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

export function PlayerFace({
  src,
  name,
  className,
  loading,
}: {
  src: string
  name: string
  className?: string
  loading?: "eager" | "lazy"
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "?"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
  }, [name])

  if (failed || !src) {
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
      src={src}
      alt={`${name}の選手画像`}
      className={cn("shrink-0 bg-muted object-cover", className)}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

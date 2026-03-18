"use client"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error(_props: ErrorProps) {
  return null
}

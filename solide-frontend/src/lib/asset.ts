export function assetUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = import.meta.env.VITE_API_URL || ''
  const clean = url.startsWith('/') ? url : '/' + url
  return base + clean
}

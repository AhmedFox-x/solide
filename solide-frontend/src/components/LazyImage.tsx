import { useRef, useState, useEffect } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  aspectRatio?: string
  minHeight?: number
  maxHeight?: number
}

const webpSrc = (url: string) => {
  if (!url.startsWith('http')) return url
  try {
    const u = new URL(url)
    u.searchParams.set('format', 'webp')
    return u.toString()
  } catch {
    return url
  }
}

export default function LazyImage({ src, alt, className, style, aspectRatio, minHeight, maxHeight }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        obs.disconnect()
      }
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} style={{
      ...style,
      ...(aspectRatio ? { aspectRatio } : {}),
      ...(minHeight ? { minHeight } : {}),
      ...(maxHeight ? { maxHeight } : {}),
    }}>
      {visible ? (
        <picture>
          <source srcSet={webpSrc(src)} type="image/webp" />
          <img src={src} alt={alt}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              const p = e.currentTarget.parentElement
              if (p instanceof HTMLPictureElement) {
                const fallback = p.querySelector('img')
                if (fallback) fallback.src = src
              }
            }}
          />
        </picture>
      ) : (
        <div className="w-full h-full bg-ivory/[0.02] animate-pulse" style={{ minHeight: 200 }} />
      )}
    </div>
  )
}
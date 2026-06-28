import { useState, useCallback } from 'react'
import type { Lang } from './translations'

const STORAGE_KEY = 'solide_lang'

function getStored(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'en' || v === 'ar') return v
  } catch {}
  return 'ar'
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(getStored)
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
  }, [])
  return [lang, setLang]
}
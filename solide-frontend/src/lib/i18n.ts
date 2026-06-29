const cache: Record<string, any> = {}

export async function loadLocale(lang: string): Promise<Record<string, any>> {
  if (cache[lang]) return cache[lang]
  const res = await fetch(`${import.meta.env.BASE_URL}locales/${lang}.json`)
  if (!res.ok) throw new Error(`Failed to load locale: ${lang}`)
  const data = await res.json()
  cache[lang] = data
  return data
}

export function resolve(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

export function pluralize(n: number, forms: [string, string, string, string]): string {
  if (n === 1) return forms[0]
  if (n === 2) return forms[1]
  if (n >= 3 && n <= 10) return forms[2]
  return forms[3]
}

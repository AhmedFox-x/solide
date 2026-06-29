export function pluralize(n: number, forms: [string, string, string, string]): string {
  if (n === 1) return forms[0]
  if (n === 2) return forms[1]
  if (n >= 3 && n <= 10) return forms[2]
  return forms[3]
}

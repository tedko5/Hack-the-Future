/** Whether every word of the query appears somewhere in the fields. Case and accents do not matter. */
export function matchesSearch(query: string, ...fields: (string | null)[]) {
  const text = normalize(fields.filter((field) => field !== null).join(' '))
  return normalize(query)
    .split(/\s+/)
    .every((word) => text.includes(word))
}

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

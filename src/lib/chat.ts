import { KNOWLEDGE } from '#/lib/knowledge.ts'

type Entry = { question: string; answer: string; tokens: Set<string> }

const STOP_WORDS = new Set(
  'a an the is are was were be been do does did i me my we us our you your it its of to in on at for and or but if what who whom which when where why how can could should would will shall there this that these those with from by as about into have has had any some just'.split(
    ' ',
  ),
)

/** Lowercase, drop punctuation and stop words, and crudely stem plurals so "echos" matches "echoes". */
export function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w))
    .map((w) => w.replace(/(es|s)$/, ''))
  return new Set(words)
}

const ENTRIES: Entry[] = [...KNOWLEDGE.matchAll(/^Q: (.+)\nA: (.+)$/gm)].map(([, question, answer]) => ({
  question,
  answer,
  tokens: tokenize(question),
}))

/** Dice similarity between two token sets: 1 = same words, 0 = nothing in common. */
function similarity(a: Set<string>, b: Set<string>) {
  if (a.size === 0 || b.size === 0) return 0
  let shared = 0
  for (const t of a) if (b.has(t)) shared++
  return (2 * shared) / (a.size + b.size)
}

/** Below this, a question is too different from the knowledge base to answer. */
const MATCH_THRESHOLD = 0.7

export type OracleReply =
  | { answer: string; related: [] }
  /** No confident match: the closest known questions, to offer as follow-ups. */
  | { answer: null; related: string[] }

/** Answer `question` from the knowledge base, or suggest the closest known questions. */
export function askCodex(question: string): OracleReply {
  const tokens = tokenize(question)
  const ranked = ENTRIES.map((entry) => ({ entry, score: similarity(tokens, entry.tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]
  if (best && best.score >= MATCH_THRESHOLD) return { answer: best.entry.answer, related: [] }
  return { answer: null, related: ranked.slice(0, 3).map((r) => r.entry.question) }
}

/** A few example questions to show as suggestion chips. */
export const SUGGESTED_QUESTIONS = ['What is the Desync?', 'How do I send an echo?', 'What are the glitch statuses?']

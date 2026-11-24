import type { Language } from '#/i18n/language.ts'
import { KNOWLEDGE } from './knowledge.ts'
import { KNOWLEDGE_NL } from './knowledge.nl.ts'

type Entry = { question: string; answer: string; tokens: Set<string> }

const words = (text: string) => new Set(text.split(' '))

const STOP_WORDS: Record<Language, Set<string>> = {
  en: words(
    'a an the is are was were be been do does did i me my we us our you your it its of to in on at for and or but if what who whom which when where why how can could should would will shall there this that these those with from by as about into have has had any some just',
  ),
  nl: words(
    'een de het is zijn was waren ben bent wordt worden doe doet ik mij me mijn wij we ons onze jij je jou jouw u uw hij zij ze er van te in op aan voor en of maar als wat wie welke wanneer waar waarom hoe kan kunnen kon moet moeten zou zullen zal die dat dit deze met uit door over heb hebt heeft hebben had nog ook al dan om bij naar er gewoon',
  ),
}

/** Plural endings, cut off crudely so "echos" matches "echoes". */
const PLURAL: Record<Language, RegExp> = { en: /(es|s)$/, nl: /(en|s)$/ }

/** Lowercase words without accents, punctuation, stop words and plural endings. */
export function tokenize(text: string, language: Language): Set<string> {
  const tokens = text
    .normalize('NFD')
    .replace(/[\p{M}'’]/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !STOP_WORDS[language].has(word))
    .map((word) => word.replace(PLURAL[language], ''))
  return new Set(tokens)
}

const parse = (knowledge: string, language: Language): Entry[] =>
  [...knowledge.matchAll(/^Q: (.+)\nA: (.+)$/gm)].map(([, question, answer]) => ({
    question,
    answer,
    tokens: tokenize(question, language),
  }))

const ENTRIES: Record<Language, Entry[]> = {
  en: parse(KNOWLEDGE, 'en'),
  nl: parse(KNOWLEDGE_NL, 'nl'),
}

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
export function askCodex(question: string, language: Language): OracleReply {
  const tokens = tokenize(question, language)
  const ranked = ENTRIES[language].map((entry) => ({ entry, score: similarity(tokens, entry.tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]
  if (best && best.score >= MATCH_THRESHOLD) return { answer: best.entry.answer, related: [] }
  return { answer: null, related: ranked.slice(0, 3).map((r) => r.entry.question) }
}

/** A few example questions to show as suggestion chips. */
export const SUGGESTED_QUESTIONS: Record<Language, string[]> = {
  en: ['What is the Desync?', 'How do I send an echo?', 'What are the glitch statuses?'],
  nl: ['Wat is de Desync?', 'Hoe meld ik een echo?', 'Wat zijn de statussen van een glitch?'],
}

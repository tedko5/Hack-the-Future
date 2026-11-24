/** Only says what changed. Clients refetch through the checked server functions. */
export type LiveEvent =
  | { type: 'glitch' | 'echo'; glitchId: string }
  /** Changes may have been missed, refetch everything. */
  | { type: 'resync' }

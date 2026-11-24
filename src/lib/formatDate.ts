/** Pinned to Achrona's (Antwerp's) time zone, so server and browser render the same text. */
export const TIME_ZONE = 'Europe/Brussels'

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE,
})

export function formatDateTime(isoTimestamp: string) {
  return dateTimeFormat.format(new Date(isoTimestamp))
}

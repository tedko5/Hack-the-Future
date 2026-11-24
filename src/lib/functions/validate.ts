import type { z } from 'zod'

/**
 * Turns a Zod schema into a server function validator. Passing the schema directly
 * would send the raw issue list to the browser; this sends the first message.
 */
export function validate<Schema extends z.ZodType>(schema: Schema) {
  return (input: z.input<Schema>): z.output<Schema> => {
    const result = schema.safeParse(input)
    if (!result.success) throw new Error(result.error.issues[0]?.message ?? 'Invalid input')
    return result.data
  }
}

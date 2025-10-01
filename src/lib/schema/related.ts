// lib/schema/related.ts
import { z } from 'zod'

export const relatedSchema = z.object({
  questions: z.array(z.string()).length(3)
})

export type RelatedQuestions = z.infer<typeof relatedSchema>


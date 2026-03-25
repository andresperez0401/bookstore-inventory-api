import { z } from 'zod';

export const calculatePriceQuerySchema = z.object({
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'currency must be an ISO-4217 code')
    .optional(),
});

export type CalculatePriceQueryInput = z.infer<typeof calculatePriceQuerySchema>;

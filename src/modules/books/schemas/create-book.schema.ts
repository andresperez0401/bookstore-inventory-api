import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1),
  isbn: z
    .string()
    .trim()
    .regex(/^(\d{10}|\d{13})$/, 'ISBN must be exactly 10 or 13 digits'),
  costUsd: z.number().positive(),
  stockQuantity: z.number().int().min(0),
  category: z.string().trim().min(1),
  supplierCountry: z.string().trim().min(1),
  sellingPriceLocal: z.number().nonnegative().optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;

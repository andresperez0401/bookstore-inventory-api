import { z } from 'zod';

export const bookQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().trim().min(1).optional(),
  threshold: z.coerce.number().int().min(0).optional(),
  search: z.string().trim().min(1).optional(),
});

export type BookQueryInput = z.infer<typeof bookQuerySchema>;

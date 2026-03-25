import { z } from 'zod';
import { createBookSchema } from './create-book.schema';

export const updateBookSchema = createBookSchema.partial();

export type UpdateBookInput = z.infer<typeof updateBookSchema>;

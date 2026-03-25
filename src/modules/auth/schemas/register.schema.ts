import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
  name: z.string().trim().min(2),
});

export type RegisterInput = z.infer<typeof registerSchema>;

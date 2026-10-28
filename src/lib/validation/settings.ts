import { z } from "zod";

export const principleSchema = z.object({
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(1).max(400),
});

export const principlesSchema = z.array(principleSchema).max(8);

export type Principle = z.infer<typeof principleSchema>;

import { z } from "zod";

export const decisionSchema = z.object({
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(1).max(400),
});

export const decisionsSchema = z.array(decisionSchema).max(8);

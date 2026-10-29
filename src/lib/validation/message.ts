import { z } from "zod";

import { MESSAGE_TOPICS, type MessageTopicValue } from "@/lib/message-topics";

export { MESSAGE_TOPICS, type MessageTopicValue };

export const messageSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "That name is too long."),
  email: z.email("Please enter a valid email address.").trim().max(160),
  topic: z.enum(Object.keys(MESSAGE_TOPICS) as [MessageTopicValue, ...MessageTopicValue[]], {
    error: "Please pick a topic.",
  }),
  body: z
    .string()
    .trim()
    .min(20, "A little more detail helps: at least 20 characters.")
    .max(4000, "Please keep it under 4,000 characters."),
});

export type MessageInput = z.infer<typeof messageSchema>;

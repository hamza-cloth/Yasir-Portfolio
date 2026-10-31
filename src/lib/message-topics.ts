// Contact-form topics. Kept free of zod so the browser can import them without the validator.
export const MESSAGE_TOPICS = {
  HIRING: "Hiring / a role",
  PROJECT: "A project",
  NETWORK_HELP: "Network or IT help",
  OTHER: "Something else",
} as const;

export type MessageTopicValue = keyof typeof MESSAGE_TOPICS;

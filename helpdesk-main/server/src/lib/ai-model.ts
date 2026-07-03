import { groq } from "@ai-sdk/groq";

export const aiModel = groq(process.env.GROQ_MODEL || "llama-3.1-8b-instant");

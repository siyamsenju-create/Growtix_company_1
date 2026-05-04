import OpenAI from "openai";
import { env } from "../config/env.js";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI | null {
  if (!env.openaiApiKey) return null;
  if (!client) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return client;
}

export async function chatComplete(system: string, user: string): Promise<string> {
  const oa = getOpenAI();
  if (!oa) {
    return `[stub] ${user.slice(0, 200)}...`;
  }
  const r = await oa.chat.completions.create({
    model: env.openaiModel,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.4,
  });
  return r.choices[0]?.message?.content ?? "";
}

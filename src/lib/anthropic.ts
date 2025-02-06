import { GenerateOptions } from "./openai";
import Anthropic from "@anthropic-ai/sdk";

export const generateAnthropicReleaseNotes = async (
  prompt: string
): Promise<string> => {
  const client = new Anthropic({
    apiKey: localStorage.getItem("ANTHROPIC_API_KEY") || "",
  });

  const message = await client.messages.create({
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
    model: "claude-3-haiku-20240307",
  });

  console.log("Anthropic response", message);

  if (!message.content || message.content.length === 0) {
    throw new Error("Failed to generate release notes");
  }

  return message.content[0].type === "text" ? message.content[0].text : "";
};

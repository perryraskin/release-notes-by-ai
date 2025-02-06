import { GenerateOptions } from "../lib/openai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const generateReleaseNotesServer = async (
  type: GenerateOptions["type"],
  model: GenerateOptions["model"],
  data: GenerateOptions["data"],
  openaiKey?: string,
  anthropicKey?: string
): Promise<string> => {
  const basePrompt =
    type === "commits"
      ? `Given these git commits, generate concise and friendly release notes. Use appropriate emojis for different types of changes. Group similar changes together:

${data.map((d) => d.message).join("\n")}`
      : `Given these git commits and their corresponding diffs, analyze both the commit messages and the actual code changes to generate detailed release notes. Use the commit messages for context and the diffs to understand the specific changes made. Use appropriate emojis for different types of changes. Group similar changes together.

${data
  .map((d) => `Commit Message: ${d.message}\n\nCode Changes:\n${d.diff}\n---\n`)
  .join("\n")}`;

  const prompt = `${basePrompt}\n\nFormat the response in markdown.`;

  if (model === "claude") {
    if (!anthropicKey) {
      throw new Error("Anthropic API key is required");
    }

    const client = new Anthropic({
      apiKey: anthropicKey,
    });

    const message = await client.messages.create({
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
      model: "claude-3-5-haiku-20241022",
    });

    console.log("Anthropic response", message);

    if (!message.content || message.content.length === 0) {
      throw new Error(
        "Failed to generate release notes: " + JSON.stringify(message)
      );
    }

    return message.content[0].type === "text" ? message.content[0].text : "";
  } else {
    if (!openaiKey) {
      throw new Error("OpenAI API key is required");
    }

    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    if (!response.choices[0].message.content) {
      throw new Error("Failed to generate release notes");
    }

    return response.choices[0].message.content;
  }
};

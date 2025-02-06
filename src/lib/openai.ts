export interface GenerateOptions {
  type: "commits" | "diffs";
  data: Array<{ message: string; diff?: string }>;
}

export class TokenLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenLimitError";
  }
}

export const generateReleaseNotes = async ({
  type,
  data,
}: GenerateOptions): Promise<string> => {
  const basePrompt =
    type === "commits"
      ? `Given these git commits, generate concise and friendly release notes. Use appropriate emojis for different types of changes. Group similar changes together:

${data.map((d) => d.message).join("\n")}`
      : `Given these git commits and their corresponding diffs, analyze both the commit messages and the actual code changes to generate detailed release notes. Use the commit messages for context and the diffs to understand the specific changes made. Use appropriate emojis for different types of changes. Group similar changes together.

${data
  .map((d) => `Commit Message: ${d.message}\n\nCode Changes:\n${d.diff}\n---\n`)
  .join("\n")}`;

  const prompt = `${basePrompt}\n\nFormat the response in markdown.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    console.log("OpenAI response", data);
    if (!response.ok) {
      if (data.error?.code === "context_length_exceeded") {
        throw new TokenLimitError(
          "The input is too long for the AI model to process. Try selecting a shorter date range or using commit messages instead of diffs."
        );
      }
      throw new Error(
        data.error?.message || "Failed to generate release notes"
      );
    }

    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof TokenLimitError) {
      throw error;
    }
    throw new Error(
      "Failed to generate release notes: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
};

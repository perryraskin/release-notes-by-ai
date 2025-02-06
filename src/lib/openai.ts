export interface GenerateOptions {
  type: "commits" | "diffs";
  model: "gpt-4o-mini" | "claude";
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
  model,
  data,
}: GenerateOptions): Promise<string> => {
  try {
    const response = await fetch("/api/generate-notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        model,
        data,
        openaiKey: localStorage.getItem("OPENAI_API_KEY"),
        anthropicKey: localStorage.getItem("ANTHROPIC_API_KEY"),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.error?.includes("context length exceeded")) {
        throw new TokenLimitError(
          "The input is too long for the AI model to process. Try selecting a shorter date range or using commit messages instead of diffs."
        );
      }
      throw new Error(result.error || "Failed to generate release notes");
    }

    return result.content;
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

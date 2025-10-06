import { getEnv } from "@/lib/env";

interface SummaryPayload {
  summary: string;
  source: "openai" | "fallback";
}

export async function generateSummaryForNote(
  title: string,
  content: string
): Promise<SummaryPayload> {
  const { OPENAI_API_KEY } = getEnv();

  if (!OPENAI_API_KEY) {
    return {
      summary:
        "AI summarization is disabled. Provide an OPENAI_API_KEY in your environment to enable this feature.",
      source: "fallback",
    };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that writes a concise summary (max 50 words) for a personal note. Respond with the summary only.",
        },
        {
          role: "user",
          content: `Title: ${title}\n\nBody: ${content}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 120,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to generate summary. The OpenAI API responded with: ${errorText}`
    );
  }

  const data = (await response.json()) as {
    choices: Array<{ message?: { content?: string } }>;
  };

  const summary = data.choices[0]?.message?.content?.trim();

  if (!summary) {
    throw new Error("OpenAI did not return a summary.");
  }

  return { summary, source: "openai" };
}

import { getEnv } from "@/lib/env";

export interface TranslationResult {
  title: string;
  content: string;
  source: "openai" | "fallback";
}

export interface GeneratedNoteResult {
  title: string;
  content: string;
  source: "openai" | "fallback";
}

// Translate both title and content into the target language code (e.g., "zh", "fr").
export async function translateContent(
  title: string,
  content: string,
  target: string
): Promise<TranslationResult> {
  const { OPENAI_API_KEY } = getEnv();

  if (!OPENAI_API_KEY) {
    // Fallback: simple stub indicating translation is unavailable
    return {
      title: `[${target}] ${title}`,
      content:
        "Translation unavailable. Provide an OPENAI_API_KEY to enable AI translation.",
      source: "fallback",
    };
  }

  const system = `You are a helpful translator. Translate the provided note title and content into the target language.\n- Return only JSON in the shape: {\n  \"title\": \"...\",\n  \"content\": \"...\"\n}\n- Do not include explanations.`;

  const user = `Target language: ${target}\nTitle: ${title}\nContent: ${content}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI translation failed: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message?: { content?: string } }>;
  };
  const contentText = data.choices[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(contentText) as { title?: string; content?: string };
    if (!parsed.title || !parsed.content) {
      throw new Error("Missing fields in translation result");
    }
    return { title: parsed.title, content: parsed.content, source: "openai" };
  } catch (e) {
    throw new Error("Failed to parse translation output from OpenAI.");
  }
}

// Generate a note (title + content) from a user prompt.
export async function generateNoteFromPrompt(prompt: string): Promise<GeneratedNoteResult> {
  const { OPENAI_API_KEY } = getEnv();

  if (!OPENAI_API_KEY) {
    return {
      title: "AI Note (demo)",
      content:
        "AI generation is disabled. Provide an OPENAI_API_KEY to enable this feature.",
      source: "fallback",
    };
  }

  const system =
    "You are an assistant that writes a concise note based on the prompt. Return only JSON with keys 'title' and 'content'. Keep it practical and under 200 words.";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI generation failed: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message?: { content?: string } }>;
  };
  const contentText = data.choices[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(contentText) as { title?: string; content?: string };
    if (!parsed.title || !parsed.content) {
      throw new Error("Missing fields in generation result");
    }
    return { title: parsed.title, content: parsed.content, source: "openai" };
  } catch (e) {
    throw new Error("Failed to parse generation output from OpenAI.");
  }
}

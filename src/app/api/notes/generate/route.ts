import { NextResponse } from "next/server";
import { createNote } from "@/lib/noteService";
import { generateNoteFromPrompt } from "@/lib/genai";

export async function POST(request: Request) {
  const { prompt, tags } = (await request.json()) as {
    prompt?: string;
    tags?: string[];
  };

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { message: "Missing 'prompt'" },
      { status: 400 }
    );
  }

  try {
    const generated = await generateNoteFromPrompt(prompt);
    const created = await createNote({
      title: generated.title,
      content: generated.content,
      tags: Array.isArray(tags) ? tags : [],
    });
    return NextResponse.json({ note: created, source: generated.source }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Unable to generate note" }, { status: 400 });
  }
}

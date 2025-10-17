import { NextResponse } from "next/server";
import { getNote, createNote, updateNote } from "@/lib/noteService";
import { translateContent } from "@/lib/genai";

export async function POST(request: Request, context: unknown) {
  const { params } = context as { params: { id: string } };
  const { target, saveAsNew } = (await request.json()) as {
    target?: string;
    saveAsNew?: boolean;
  };

  if (!target || typeof target !== "string") {
    return NextResponse.json(
      { message: "Missing 'target' language code" },
      { status: 400 }
    );
  }

  const note = await getNote(params.id);
  if (!note) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  try {
    const result = await translateContent(note.title, note.content, target);

    if (saveAsNew) {
      const created = await createNote({
        title: result.title,
        content: result.content,
        tags: note.tags ?? [],
      });
      return NextResponse.json({ note: created, source: result.source }, { status: 201 });
    }

    const updated = await updateNote(note.id, {
      title: result.title,
      content: result.content,
    });
    return NextResponse.json({ note: updated, source: result.source });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Unable to translate note" }, { status: 400 });
  }
}

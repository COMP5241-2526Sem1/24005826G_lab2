import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getNote, updateNote } from "@/lib/noteService";
import { generateSummaryForNote } from "@/lib/summary";

export async function POST(_: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  const note = await getNote(params.id);

  if (!note) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  try {
    const { summary, source } = await generateSummaryForNote(
      note.title,
      note.content
    );

    const updated = await updateNote(note.id, { summary });

    return NextResponse.json({ note: updated, source });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unable to generate summary" },
      { status: 500 }
    );
  }
}

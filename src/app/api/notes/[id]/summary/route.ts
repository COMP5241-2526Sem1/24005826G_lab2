import { NextResponse } from "next/server";

import { getNote, updateNote } from "@/lib/noteService";
import { generateSummaryForNote } from "@/lib/summary";

interface RouteParams {
  params: { id: string };
}

export async function POST(_: Request, { params }: RouteParams) {
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

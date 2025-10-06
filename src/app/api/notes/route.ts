import { NextResponse } from "next/server";

import { createNote, listNotes, noteInputSchema } from "@/lib/noteService";

export async function GET() {
  const notes = await listNotes();
  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = noteInputSchema.parse(payload);
    const created = await createNote(parsed);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Unable to create note" },
      { status: 400 }
    );
  }
}

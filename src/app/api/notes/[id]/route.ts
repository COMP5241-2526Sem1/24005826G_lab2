import { NextResponse } from "next/server";

import {
  deleteNote,
  getNote,
  noteUpdateSchema,
  updateNote,
} from "@/lib/noteService";

interface RouteParams {
  params: { id: string };
}

export async function GET(_: Request, { params }: RouteParams) {
  const note = await getNote(params.id);
  if (!note) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const payload = await request.json();
    const parsed = noteUpdateSchema.parse(payload);
    const updated = await updateNote(params.id, parsed);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Unable to update note" },
      { status: 400 }
    );
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    await deleteNote(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Unable to delete note" },
      { status: 400 }
    );
  }
}

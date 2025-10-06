import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const noteInputSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]).optional(),
});

export const noteUpdateSchema = noteInputSchema.partial().extend({
  summary: z.string().nullish(),
});

export type NoteInput = z.infer<typeof noteInputSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;

export async function listNotes() {
  const notes = await prisma.note.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return notes;
}

export async function getNote(id: string) {
  return prisma.note.findUnique({ where: { id } });
}

export async function createNote(input: NoteInput) {
  const payload = noteInputSchema.parse(input);
  return prisma.note.create({
    data: {
      ...payload,
      tags: payload.tags ?? [],
    },
  });
}

export async function updateNote(id: string, input: NoteUpdateInput) {
  const payload = noteUpdateSchema.parse(input);
  return prisma.note.update({
    where: { id },
    data: {
      ...payload,
      tags: payload.tags ?? undefined,
    },
  });
}

export async function deleteNote(id: string) {
  await prisma.note.delete({ where: { id } });
}

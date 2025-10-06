import { randomUUID } from "crypto";

import { createNote, deleteNote, getNote } from "@/lib/noteService";

async function main() {
  const uniqueSuffix = randomUUID();
  const title = `Automated test note ${uniqueSuffix}`;
  const content = "This note was created by the automated database test.";

  const created = await createNote({
    title,
    content,
    tags: ["automation", "verification"],
  });

  const retrieved = await getNote(created.id);

  if (!retrieved || retrieved.content !== content) {
    throw new Error("Database verification failed: note content mismatch.");
  }

  await deleteNote(created.id);

  console.log("Database connectivity verified ✔");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

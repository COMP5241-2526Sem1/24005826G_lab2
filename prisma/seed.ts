import { prisma } from "@/lib/prisma";

async function main() {
  const notes = [
    {
      title: "Welcome to the cloud",
      content:
        "Your notes are now stored in a serverless Postgres database. Feel free to edit or remove this note.",
      tags: ["intro", "cloud"],
    },
    {
      title: "Deploy checklist",
      content: "Remember to set DATABASE_URL and OPENAI_API_KEY in the Vercel dashboard before deploying.",
      tags: ["vercel", "ops"],
    },
  ];

  for (const note of notes) {
    try {
      await prisma.note.create({ data: note });
    } catch (error) {
      console.warn(`Skipping seed note "${note.title}":`, error);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

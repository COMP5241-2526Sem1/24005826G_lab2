import { NoteBoard } from "@/components/NoteBoard";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-white sm:px-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-2 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Cloud-native notetaking
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Your ideas, captured and summarised in seconds
          </h1>
          <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
            Every note you create is stored in a serverless Postgres database so it
            can be accessed anywhere Vercel deploys your app. Tap the AI button to
            get a concise summary generated with your configured LLM provider.
          </p>
        </header>

        <NoteBoard />
      </div>
    </main>
  );
}

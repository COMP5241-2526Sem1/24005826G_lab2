import { NoteBoard } from "@/components/NoteBoard";

const quickTips = [
  {
    title: "Stay organised",
    description:
      "Use tags to group related notes. You can filter by tag or keyword using the search box.",
  },
  {
    title: "Summaries on demand",
    description:
      "Click “Generate AI summary” to create a bite-sized recap. No key? You’ll see a helpful fallback instead.",
  },
  {
    title: "Keyboard friendly",
    description:
      "Press ⌘/Ctrl + Enter while focused in the content box to save a new note instantly.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen px-6 pb-20 pt-14 text-neutral-900 dark:text-neutral-50 sm:px-10">
      <div className="mx-auto max-w-7xl space-y-12">
        <header className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-neutral-200">
              Cloud-native notetaking
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Your ideas, captured, organised, and summarised in seconds
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              Store notes in Postgres, generate instant AI summaries, and review everything from any Vercel region. SkyNotes keeps your thought process flowing, with delightful UX tuned for modern teams.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 font-medium text-neutral-700 shadow-sm backdrop-blur dark:bg-white/10 dark:text-neutral-200">
                ✨ AI summaries
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 font-medium text-neutral-700 shadow-sm backdrop-blur dark:bg-white/10 dark:text-neutral-200">
                📦 Serverless Postgres
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 font-medium text-neutral-700 shadow-sm backdrop-blur dark:bg-white/10 dark:text-neutral-200">
                ⚡️ Instant sync
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 font-medium text-neutral-700 shadow-sm backdrop-blur dark:bg-white/10 dark:text-neutral-200">
                🌓 Adaptive theme
              </span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/10">
            <h2 className="text-lg font-semibold">Quick tips</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-300">
              Make the most of SkyNotes with these power-user shortcuts.
            </p>
            <ul className="mt-5 space-y-4">
              {quickTips.map((tip) => (
                <li key={tip.title} className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">
                    {tip.title}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-300">
                    {tip.description}
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </header>

        <section className="rounded-3xl border border-white/40 bg-white/75 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/50">
          <div className="mx-auto max-w-6xl">
            <NoteBoard />
          </div>
        </section>
      </div>
    </main>
  );
}

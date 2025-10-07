"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  title: string;
  content: string;
  tags: string;
}

const initialFormState: FormState = {
  title: "",
  content: "",
  tags: "",
};

const filters = {
  ALL: "all",
  WITH_SUMMARY: "with-summary",
  WITHOUT_SUMMARY: "without-summary",
} as const;

export function NoteBoard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[keyof typeof filters]>(filters.ALL);
  const [showToast, setShowToast] = useState<string | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/notes", { cache: "no-store" });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to load notes");
      }
      const data = (await response.json()) as { notes: Note[] };
      setNotes(
        data.notes.map((note) => ({
          ...note,
          tags: note.tags ?? [],
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (!showToast) return;
    const timeout = setTimeout(() => setShowToast(null), 3200);
    return () => clearTimeout(timeout);
  }, [showToast]);

  const filteredNotes = useMemo<Note[]>(() => {
    const trimmedSearch = search.trim().toLowerCase();
    const filtered = notes
      .filter((note) => {
        if (!trimmedSearch) return true;
        const haystack = [note.title, note.content, note.summary ?? "", note.tags.join(" ")]
          .join(" ")
          .toLowerCase();
        return haystack.includes(trimmedSearch);
      })
      .filter((note) => {
        if (activeFilter === filters.WITH_SUMMARY) return Boolean(note.summary);
        if (activeFilter === filters.WITHOUT_SUMMARY) return !note.summary;
        return true;
      });

    return filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [notes, search, activeFilter]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to create note");
      }

      const created = (await response.json()) as Note;
      setNotes((current) => [
        {
          ...created,
          tags: created.tags ?? [],
        },
        ...current,
      ]);
      setShowToast("Note saved");
      setForm(initialFormState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create note");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<FormState>) => {
    setSavingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updates,
          tags: updates.tags
            ?.split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to update note");
      }

      const updated = (await response.json()) as Note;
      setNotes((current) =>
        current.map((note) =>
          note.id === id
            ? {
                ...note,
                ...updated,
                tags: updated.tags ?? [],
              }
            : note
        )
      );
      setEditingId(null);
      setShowToast("Changes saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update note");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmation = confirm(
      "Are you sure you want to delete this note? This cannot be undone."
    );
    if (!confirmation) return;

    setSavingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to delete note");
      }

      setNotes((current) => current.filter((note) => note.id !== id));
    setShowToast("Note deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete note");
    } finally {
      setSavingId(null);
    }
  };

  const handleSummarize = async (id: string) => {
    setSummarizingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${id}/summary`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to generate summary");
      }

      const data = (await response.json()) as {
        note: Note;
        source: string;
      };

      setNotes((current) =>
        current.map((note) =>
          note.id === id
            ? {
                ...note,
                summary: data.note.summary,
                updatedAt: data.note.updatedAt,
                tags: data.note.tags ?? note.tags,
              }
            : note
        )
      );
      setShowToast(
        data.source === "openai" ? "Summary updated" : "Summary unavailable"
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate summary"
      );
    } finally {
      setSummarizingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {showToast && (
        <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="flex items-center gap-3 rounded-full border border-white/60 bg-white/80 px-5 py-2.5 text-sm font-medium text-neutral-700 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/80 dark:text-neutral-100"
          >
            <span>✅</span>
            <span>{showToast}</span>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <header className="flex flex-col gap-2 border-b border-white/60 pb-5 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Create a new note</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-300">
                Notes sync instantly to Postgres and stay available across deployments.
              </p>
            </div>
            <button
              onClick={fetchNotes}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-neutral-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-white/10 dark:text-neutral-200"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </header>

        <form className="mt-5 space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-white/5"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Meeting notes, research ideas, ..."
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              className="min-h-[140px] w-full rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-white/5"
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              placeholder="Capture the details you do not want to forget."
              required
              onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  if (!creating) {
                    event.currentTarget.form?.requestSubmit();
                  }
                }
              }}
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Tip: press ⌘/Ctrl + Enter to save quickly.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="tags">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              className="w-full rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-white/5"
              value={form.tags}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  tags: event.target.value,
                }))
              }
              placeholder="productivity, meeting, research"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:from-neutral-500 disabled:to-neutral-500"
              disabled={creating}
            >
              {creating ? "Saving…" : "Save note"}
            </button>
            {error && (
              <span className="text-sm text-red-600" role="alert">
                {error}
              </span>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <header className="flex flex-col gap-3 border-b border-white/60 pb-5 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your notes</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-300">
              {loading
                ? "Loading notes from the database…"
                : `${filteredNotes.length} note${filteredNotes.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-neutral-200">
              <span className="inline-flex items-center gap-1">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    summarizingId ? "bg-purple-400" : "bg-emerald-400"
                  }`}
                  aria-hidden
                />
                {summarizingId ? "Working with AI" : "Synced"}
              </span>
              <span className="h-4 w-px bg-neutral-300 dark:bg-white/20" aria-hidden />
              <span>{notes.length} total</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search notes or tags"
                  aria-label="Search notes"
                  className="w-full rounded-full border border-neutral-200 bg-white/90 py-2 pl-10 pr-4 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-white/5"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  🔍
                </span>
              </div>
              <div className="flex gap-1 rounded-full bg-white/70 p-1 text-xs shadow-sm dark:bg-white/5">
                {[
                  { key: filters.ALL, label: "All" },
                  { key: filters.WITH_SUMMARY, label: "With summary" },
                  { key: filters.WITHOUT_SUMMARY, label: "Needs summary" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    aria-pressed={activeFilter === filter.key}
                    className={`rounded-full px-3 py-1 transition ${
                      activeFilter === filter.key
                        ? "bg-blue-600 text-white shadow"
                        : "text-neutral-500 hover:bg-white/90 dark:text-neutral-300"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Fetching your notes…
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-10 text-center text-sm text-neutral-500 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="font-medium text-neutral-600 dark:text-neutral-200">
              No notes match your filters.
            </p>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-400">
              Try adjusting the search query or switch back to “All”.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredNotes.map((note) => {
              const isEditing = editingId === note.id;
              const isBusy = savingId === note.id || summarizingId === note.id;
              return (
                <li
                  key={note.id}
                  className="flex h-full flex-col justify-between rounded-2xl border border-white/60 bg-white/75 p-5 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-slate-900/70"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold leading-tight">
                          {note.title}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Updated {new Date(note.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-xs font-semibold text-neutral-500 transition hover:border-blue-100 hover:text-blue-600 dark:border-white/10 dark:bg-white/10 dark:text-neutral-200"
                          onClick={() =>
                            setEditingId((current) =>
                              current === note.id ? null : note.id
                            )
                          }
                        >
                          ✏️ {isEditing ? "Cancel" : "Edit"}
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-400/40 dark:bg-red-900/30 dark:text-red-200"
                          onClick={() => handleDelete(note.id)}
                          disabled={isBusy}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-200">
                      {note.content}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag: string) => (
                          <span
                            key={`${note.id}-${tag}`}
                            className="rounded-full bg-blue-50/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div
                      className="rounded-xl bg-slate-50/80 p-4 text-sm shadow-inner dark:bg-white/10"
                      aria-live="polite"
                      aria-atomic="false"
                    >
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-300">
                        <span>Summary</span>
                        {note.summary ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100">
                            updated
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-100">
                            pending
                          </span>
                        )}
                      </p>
                      <p className="mt-2 text-neutral-700 dark:text-neutral-200">
                        {note.summary ?? "No summary yet. Generate one below."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <button
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-200"
                      onClick={() => handleSummarize(note.id)}
                      disabled={summarizingId === note.id}
                      aria-busy={summarizingId === note.id}
                    >
                      {summarizingId === note.id
                        ? "Asking OpenAI…"
                        : "Generate AI summary"}
                    </button>

                    {isEditing && (
                      <form
                        className="space-y-3 rounded-2xl border border-neutral-200 bg-white/80 p-3 shadow-inner dark:border-white/10 dark:bg-white/5"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const formData = new FormData(event.currentTarget);
                          handleUpdate(note.id, {
                            title: (formData.get("title") as string) ?? note.title,
                            content:
                              (formData.get("content") as string) ?? note.content,
                            tags:
                              (formData.get("tags") as string) ?? note.tags.join(", "),
                          });
                        }}
                      >
                        <div>
                          <label
                            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-300"
                            htmlFor={`title-${note.id}`}
                          >
                            Title
                          </label>
                          <input
                            id={`title-${note.id}`}
                            name="title"
                            defaultValue={note.title}
                            className="w-full rounded-lg border border-neutral-200 bg-white/70 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-white/5"
                          />
                        </div>
                        <div>
                          <label
                            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-300"
                            htmlFor={`content-${note.id}`}
                          >
                            Content
                          </label>
                          <textarea
                            id={`content-${note.id}`}
                            name="content"
                            defaultValue={note.content}
                            className="min-h-[100px] w-full rounded-lg border border-neutral-200 bg-white/70 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-white/5"
                          />
                        </div>
                        <div>
                          <label
                            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-300"
                            htmlFor={`tags-${note.id}`}
                          >
                            Tags (comma separated)
                          </label>
                          <input
                            id={`tags-${note.id}`}
                            name="tags"
                            defaultValue={note.tags.join(", ")}
                            className="w-full rounded-lg border border-neutral-200 bg-white/70 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-white/5"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-full bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
                          disabled={savingId === note.id}
                        >
                          {savingId === note.id ? "Saving…" : "Save changes"}
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

export function NoteBoard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/notes", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load notes");
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

  const sortedNotes = useMemo(
    () =>
      [...notes].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [notes]
  );

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
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
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <header className="mb-4 flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Add a new note</h2>
          <p className="text-sm text-neutral-500">
            Notes are synced to your cloud database instantly and can be
            summarised with AI.
          </p>
        </header>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-800/20 dark:border-neutral-700 dark:bg-neutral-800"
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
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="content"
            >
              Content
            </label>
            <textarea
              id="content"
              className="min-h-[120px] w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-800/20 dark:border-neutral-700 dark:bg-neutral-800"
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              placeholder="Capture the details you do not want to forget."
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="tags">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-800/20 dark:border-neutral-700 dark:bg-neutral-800"
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
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
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your notes</h2>
            <p className="text-sm text-neutral-500">
              {loading
                ? "Loading notes from the database…"
                : `${sortedNotes.length} note${sortedNotes.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            onClick={fetchNotes}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            disabled={loading}
          >
            Refresh
          </button>
        </header>

        {loading ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Fetching your notes…
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No notes yet. Create one above to get started.
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedNotes.map((note) => {
              const isEditing = editingId === note.id;
              const isBusy = savingId === note.id || summarizingId === note.id;
              return (
                <li
                  key={note.id}
                  className="flex h-full flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold leading-tight">
                          {note.title}
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Updated {new Date(note.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
                          onClick={() =>
                            setEditingId((current) =>
                              current === note.id ? null : note.id
                            )
                          }
                        >
                          {isEditing ? "Cancel" : "Edit"}
                        </button>
                        <button
                          className="text-sm font-medium text-red-600 hover:text-red-500"
                          onClick={() => handleDelete(note.id)}
                          disabled={isBusy}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-200">
                      {note.content}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800/70">
                      <p className="text-xs font-semibold uppercase text-neutral-500">
                        Summary
                      </p>
                      <p className="mt-1 text-neutral-700 dark:text-neutral-200">
                        {note.summary ?? "No summary yet. Generate one below."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <button
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      onClick={() => handleSummarize(note.id)}
                      disabled={summarizingId === note.id}
                    >
                      {summarizingId === note.id
                        ? "Asking OpenAI…"
                        : "Generate AI summary"}
                    </button>

                    {isEditing && (
                      <form
                        className="space-y-2 border-t border-neutral-200 pt-3 dark:border-neutral-700"
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
                          <label className="mb-1 block text-xs font-medium" htmlFor={`title-${note.id}`}>
                            Title
                          </label>
                          <input
                            id={`title-${note.id}`}
                            name="title"
                            defaultValue={note.title}
                            className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-800/20 dark:border-neutral-700 dark:bg-neutral-800"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium" htmlFor={`content-${note.id}`}>
                            Content
                          </label>
                          <textarea
                            id={`content-${note.id}`}
                            name="content"
                            defaultValue={note.content}
                            className="min-h-[100px] w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-800/20 dark:border-neutral-700 dark:bg-neutral-800"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium" htmlFor={`tags-${note.id}`}>
                            Tags (comma separated)
                          </label>
                          <input
                            id={`tags-${note.id}`}
                            name="tags"
                            defaultValue={note.tags.join(", ")}
                            className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-800/20 dark:border-neutral-700 dark:bg-neutral-800"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
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

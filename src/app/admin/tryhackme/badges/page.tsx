"use client";
import useSWR from "swr";
import { useMemo, useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TryHackMeBadgesAdmin() {
  const [page, setPage] = useState(1);
  const { data, mutate, isLoading } = useSWR(
    `/api/admin/tryhackme/badges?page=${page}&limit=24`,
    fetcher
  );
  const badges = data?.badges || [];
  const total = data?.total || 0;
  const pageSize = data?.pageSize || 24;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as any;
    const body = {
      title: form.title.value,
      thmBadgeId: form.thmBadgeId.value || undefined,
      imageUrl: form.imageUrl.value || undefined,
      link: form.link.value || undefined,
      description: form.description.value || undefined,
      category: form.category.value || undefined,
      tags: form.tags.value
        ? form.tags.value.split(",").map((t: string) => t.trim())
        : [],
      earnedAt: form.earnedAt.value ? new Date(form.earnedAt.value) : undefined,
      visibility: form.visibility.value,
    };
    const res = await fetch("/api/admin/tryhackme/badges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Failed to add badge");
      return;
    }
    form.reset();
    mutate();
  }

  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function onSaveBadge(id: string, payload: any) {
    try {
      setBusy(id);
      const res = await fetch(`/api/admin/tryhackme/badges/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Update failed");
      }
      setEditingId(null);
      mutate();
    } catch (e: any) {
      alert(e.message || "Unable to save");
    } finally {
      setBusy(null);
    }
  }

  async function onDeleteBadge(id: string) {
    if (!confirm("Delete this badge? This cannot be undone.")) return;
    try {
      setBusy(id);
      const res = await fetch(`/api/admin/tryhackme/badges/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Delete failed");
      }
      mutate();
    } catch (e: any) {
      alert(e.message || "Unable to delete");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          TryHackMe Badges
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Total: {total}
        </div>
      </div>

      <form
        onSubmit={onAdd}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-lg border p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      >
        <input
          name="title"
          placeholder="Title"
          required
          className="px-3 py-2 rounded border bg-transparent"
        />
        <input
          name="thmBadgeId"
          placeholder="Badge ID (optional)"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <input
          name="imageUrl"
          placeholder="Image URL"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <input
          name="link"
          placeholder="Link"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <input
          name="description"
          placeholder="Description"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <input
          name="category"
          placeholder="Category"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <input
          name="tags"
          placeholder="tags: comma,separated"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <input name="earnedAt" type="date" className="px-3 py-2 rounded border bg-transparent" />
        <select name="visibility" className="px-3 py-2 rounded border bg-transparent">
          <option value="public">public</option>
          <option value="private">private</option>
        </select>
        <div className="md:col-span-3">
          <button className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm">
            Add Badge
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading && <div>Loading…</div>}
        {badges.map((b: any) => {
          const isEditing = editingId === b._id;
          return (
            <div
              key={b._id}
              className="rounded-lg border p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 space-y-3"
            >
              <div className="flex items-center gap-3">
                {b.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {b.title}
                  </div>
                  {b.category && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {b.category}
                    </div>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <input
                    defaultValue={b.title}
                    onChange={(e) => (b.title = e.target.value)}
                    className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                  />
                  <input
                    defaultValue={b.imageUrl || ''}
                    placeholder="Image URL"
                    onChange={(e) => (b.imageUrl = e.target.value)}
                    className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                  />
                  <input
                    defaultValue={b.link || ''}
                    placeholder="Link"
                    onChange={(e) => (b.link = e.target.value)}
                    className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                  />
                  <input
                    defaultValue={(b.tags || []).join(', ')}
                    placeholder="tags: comma,separated"
                    onChange={(e) => (b.tags = e.target.value)}
                    className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      className="px-3 py-1 rounded border text-sm"
                      onClick={() => setEditingId(null)}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={busy === b._id}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                      onClick={() =>
                        onSaveBadge(b._id, {
                          title: b.title,
                          imageUrl: b.imageUrl,
                          link: b.link,
                          tags:
                            typeof b.tags === 'string'
                              ? b.tags.split(',').map((t: string) => t.trim())
                              : b.tags,
                        })
                      }
                      type="button"
                    >
                      {busy === b._id ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(b.tags || []).map((t: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                      >
                        {t}
                      </span>
                    ))}
                    {(!b.tags || b.tags.length === 0) && (
                      <span className="text-xs text-gray-400">No tags</span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="px-3 py-1 rounded border text-sm"
                      onClick={() => setEditingId(b._id)}
                    >
                      Edit
                    </button>
                    <button
                      disabled={busy === b._id}
                      className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                      onClick={() => onDeleteBadge(b._id)}
                    >
                      {busy === b._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-2 rounded border"
        >
          Prev
        </button>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Page {page} of {totalPages}
        </div>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-2 rounded border"
        >
          Next
        </button>
      </div>
    </div>
  );
}

"use client";
import useSWR from "swr";
import { useMemo, useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TryHackMeRoomsAdmin() {
  const [page, setPage] = useState(1);
  const { data, mutate, isLoading } = useSWR(
    `/api/admin/tryhackme/rooms?page=${page}&limit=24`,
    fetcher
  );
  const rooms = data?.rooms || [];
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
      thmRoomId: form.thmRoomId.value || undefined,
      slug: form.slug.value || undefined,
      link: form.link.value || undefined,
      difficulty: form.difficulty.value,
      points: form.points.value ? Number(form.points.value) : 0,
      completedAt: form.completedAt.value ? new Date(form.completedAt.value) : undefined,
      tags: form.tags.value
        ? form.tags.value.split(",").map((t: string) => t.trim())
        : [],
    };
    const res = await fetch("/api/admin/tryhackme/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Failed to add room");
      return;
    }
    form.reset();
    mutate();
  }

  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function onSaveRoom(id: string, payload: any) {
    try {
      setBusy(id);
      const res = await fetch(`/api/admin/tryhackme/rooms/${id}`, {
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

  async function onDeleteRoom(id: string) {
    if (!confirm("Delete this room entry? This cannot be undone.")) return;
    try {
      setBusy(id);
      const res = await fetch(`/api/admin/tryhackme/rooms/${id}`, {
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
          TryHackMe Rooms
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
          name="thmRoomId"
          placeholder="Room ID (optional)"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <input
          name="slug"
          placeholder="Slug (optional)"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <input
          name="link"
          placeholder="Link"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <select name="difficulty" className="px-3 py-2 rounded border bg-transparent">
          <option value="unknown">unknown</option>
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
          <option value="insane">insane</option>
        </select>
        <input
          name="points"
          type="number"
          placeholder="Points"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <input
          name="completedAt"
          type="date"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <input
          name="tags"
          placeholder="tags: comma,separated"
          className="px-3 py-2 rounded border bg-transparent"
        />
        <div className="md:col-span-3">
          <button className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm">
            Add Room
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading && <div>Loading…</div>}
        {rooms.map((r: any) => {
          const isEditing = editingId === r._id;
          return (
            <div
              key={r._id}
              className="rounded-lg border p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 space-y-3"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    defaultValue={r.title}
                    onChange={(e) => (r.title = e.target.value)}
                    className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      defaultValue={r.slug || ''}
                      placeholder="Slug"
                      onChange={(e) => (r.slug = e.target.value)}
                      className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                    />
                    <input
                      defaultValue={r.link || ''}
                      placeholder="Link"
                      onChange={(e) => (r.link = e.target.value)}
                      className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      defaultValue={r.difficulty || 'unknown'}
                      onChange={(e) => (r.difficulty = e.target.value)}
                      className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                    >
                      <option value="unknown">unknown</option>
                      <option value="easy">easy</option>
                      <option value="medium">medium</option>
                      <option value="hard">hard</option>
                      <option value="insane">insane</option>
                    </select>
                    <input
                      defaultValue={r.points || 0}
                      type="number"
                      onChange={(e) => (r.points = Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                    />
                  </div>
                  <input
                    defaultValue={(r.tags || []).join(', ')}
                    placeholder="tags: comma,separated"
                    onChange={(e) => (r.tags = e.target.value)}
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
                      disabled={busy === r._id}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                      onClick={() =>
                        onSaveRoom(r._id, {
                          title: r.title,
                          slug: r.slug,
                          link: r.link,
                          difficulty: r.difficulty,
                          points: r.points,
                          tags:
                            typeof r.tags === 'string'
                              ? r.tags.split(',').map((t: string) => t.trim())
                              : r.tags,
                        })
                      }
                      type="button"
                    >
                      {busy === r._id ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {r.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      {r.difficulty}
                    </span>
                    {r.points ? <span>{r.points} pts</span> : null}
                  </div>
                  {r.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(r.tags || []).map((t: string, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="px-3 py-1 rounded border text-sm"
                      onClick={() => setEditingId(r._id)}
                    >
                      Edit
                    </button>
                    <button
                      disabled={busy === r._id}
                      className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                      onClick={() => onDeleteRoom(r._id)}
                    >
                      {busy === r._id ? 'Deleting…' : 'Delete'}
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

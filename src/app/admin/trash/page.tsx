"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => r.json());

type EntityType =
  | "user"
  | "post"
  | "lottie"
  | "project"
  | "book"
  | "comment"
  | "character"
  | "journal";

export default function TrashPage() {
  const { toast } = useToast();
  const { data, mutate, isLoading } = useSWR("/api/admin/trash", fetcher);
  const [selected, setSelected] = useState<Record<string, Set<string>>>(
    () => ({})
  );
  const [filter, setFilter] = useState<EntityType | "all">("all");
  const loading = isLoading || !data;

  const counts = useMemo(() => {
    const d = data?.data || {};
    return {
      user: d.users?.length || 0,
      post: d.posts?.length || 0,
      lottie: d.lotties?.length || 0,
      project: d.projects?.length || 0,
      book: d.books?.length || 0,
      comment: d.comments?.length || 0,
      character: d.characters?.length || 0,
      journal: d.journals?.length || 0,
    } as Record<EntityType, number>;
  }, [data]);

  const listFor = (type: EntityType) => (data?.data?.[
    type === "user"
      ? "users"
      : type === "post"
      ? "posts"
      : type === "lottie"
      ? "lotties"
      : (type + "s")
  ] || []) as Array<any>;

  const act = async (
    type: EntityType,
    id: string,
    action: "restore" | "delete"
  ) => {
    try {
      const res = await fetch("/api/admin/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type, id, action }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false)
        throw new Error(body?.error || "Operation failed");
      toast({
        title: action === "restore" ? "Restored" : "Deleted",
        description: body?.message || "Action completed",
      });
      await mutate();
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed",
        variant: "destructive",
      });
    }
  };

  const bulkAct = async (action: "restore" | "delete") => {
    const entries = Object.entries(selected);
    for (const [type, ids] of entries) {
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        await act(type as EntityType, id, action);
      }
    }
    setSelected({});
  };

  const toggle = (type: EntityType, id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      const set = new Set(next[type] || []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      next[type] = set;
      return next;
    });
  };

  const types: Array<EntityType | "all"> = [
    "all",
    "user",
    "post",
    "lottie",
    "project",
    "book",
    "comment",
    "character",
    "journal",
  ];

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trash</h1>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 border rounded"
            onClick={() => mutate()}
            title="Refresh"
          >
            Refresh
          </button>
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            onClick={() => bulkAct("restore")}
            disabled={Object.values(selected).every((s) => !s || s.size === 0)}
          >
            Restore Selected
          </button>
          <button
            className="px-3 py-2 border rounded text-red-600 disabled:opacity-50"
            onClick={() => bulkAct("delete")}
            disabled={Object.values(selected).every((s) => !s || s.size === 0)}
          >
            Delete Selected
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            className={`px-3 py-1 rounded border ${
              filter === t ? "bg-gray-900 text-white" : "bg-white"
            }`}
            onClick={() => setFilter(t as EntityType | "all")}
          >
            {t === "all" ? "All" : String(t).charAt(0).toUpperCase() + String(t).slice(1)}
            {t !== "all" ? ` (${counts[t as EntityType] || 0})` : ""}
          </button>
        ))}
      </div>

      {types
        .filter((t) => (filter === "all" ? t !== "all" : t === filter))
        .map((t) => {
          if (t === "all") return null;
          const items = listFor(t as EntityType);
          return (
            <div key={t} className="space-y-2">
              <h2 className="text-lg font-semibold">
                {String(t).charAt(0).toUpperCase() + String(t).slice(1)}
              </h2>
              <div className="divide-y border rounded bg-white dark:bg-gray-800">
                {items.map((it: any) => (
                  <div
                    key={it._id}
                    className="flex items-center justify-between p-3 gap-3"
                  >
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!selected[t as string]?.has(it._id)}
                        onChange={() => toggle(t as EntityType, it._id)}
                      />
                      <div className="text-sm">
                        <div className="font-medium">
                          {it.name ||
                            it.title ||
                            it.fileName ||
                            (it.content
                              ? `${String(it.content).slice(0, 80)}$${
                                  String(it.content).length > 80 ? "…" : ""
                                }`
                              : "Untitled")}
                        </div>
                        <div className="text-gray-500">
                          Deleted {new Date(it.deletedAt).toLocaleString()}
                        </div>
                      </div>
                    </label>
                    <div className="space-x-2">
                      <button
                        className="px-3 py-1 border rounded hover:bg-green-50"
                        onClick={() => act(t as EntityType, it._id, "restore")}
                      >
                        Restore
                      </button>
                      <button
                        className="px-3 py-1 border rounded text-red-600 hover:bg-red-50"
                        onClick={() => act(t as EntityType, it._id, "delete")}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-sm">No items.</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}

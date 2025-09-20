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

  const selectionCount = useMemo(() => {
    const vals = Object.values(selected) as Array<Set<string>>;
    return vals.reduce((acc, set) => acc + (set?.size || 0), 0);
  }, [selected]);

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

  const toggle = (type: EntityType, id: unknown) => {
    const sid = String(id);
    setSelected((prev) => {
      const next: Record<string, Set<string>> = { ...prev } as Record<string, Set<string>>;
      const current = next[type] ?? new Set<string>();
      const set = new Set<string>(current);
      if (set.has(sid)) set.delete(sid);
      else set.add(sid);
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
            className="px-3 py-2 border rounded text-red-600"
            onClick={async () => {
              if (!confirm('Empty trash for all types? This permanently deletes these items.')) return;
              try {
                const res = await fetch('/api/admin/trash', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ action: 'empty', type: 'all' }),
                });
                const body = await res.json().catch(() => ({}));
                if (!res.ok || body?.success === false) throw new Error(body?.error || 'Failed to empty trash');
                toast({ title: 'Deleted', description: 'Perma-deleted all trashed items' });
                await mutate();
              } catch (e) {
                toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
              }
            }}
            title="Empty Trash"
          >
            Empty Trash
          </button>
          <button
            className="px-3 py-2 border rounded disabled:opacity-50 bg-secondary hover:bg-secondary/80"
            onClick={() => bulkAct("restore")}
            disabled={selectionCount === 0}
            aria-disabled={selectionCount === 0}
          >
            Restore Selected{selectionCount ? ` (${selectionCount})` : ''}
          </button>
          <button
            className="px-3 py-2 border rounded text-red-600 disabled:opacity-50 bg-background hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={() => bulkAct("delete")}
            disabled={selectionCount === 0}
            aria-disabled={selectionCount === 0}
          >
            Delete Selected{selectionCount ? ` (${selectionCount})` : ''}
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            className={`px-3 py-1 rounded-md border transition-colors ${
              filter === t
                ? 'bg-foreground text-background dark:bg-gray-900 dark:text-white'
                : 'bg-muted text-foreground hover:bg-muted/80 dark:bg-gray-800 dark:text-gray-100'
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
              <div className="divide-y border rounded-md bg-card text-card-foreground dark:bg-gray-800">
                {items.map((it: any, i: number) => (
                  <div
                    key={`${t}-${String(it?._id ?? it?.id ?? i)}`}
                    className="flex items-center justify-between p-3 gap-3"
                  >
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!selected[t as string]?.has(String(it?._id ?? it?.id))}
                        onChange={() => toggle(t as EntityType, it?._id ?? it?.id)}
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
                        className="px-3 py-1 border rounded-md bg-secondary hover:bg-secondary/80 dark:hover:bg-gray-700"
                        onClick={() => act(t as EntityType, String(it?._id ?? it?.id), "restore")}
                      >
                        Restore
                      </button>
                      <button
                        className="px-3 py-1 border rounded-md text-red-600 bg-background hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => act(t as EntityType, String(it?._id ?? it?.id), "delete")}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="p-6 text-center text-muted-foreground">
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

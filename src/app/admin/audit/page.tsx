"use client";

import { useEffect, useState } from 'react';

interface AuditLogVm {
  _id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  userEmail?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogVm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ action: '', entityType: '', userEmail: '', entityId: '', start: '', end: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 20, hasNextPage: false, hasPreviousPage: false });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pagination.currentPage),
        limit: String(pagination.itemsPerPage),
        ...(filters.action && { action: filters.action }),
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.userEmail && { userEmail: filters.userEmail }),
        ...(filters.entityId && { entityId: filters.entityId }),
        ...(filters.start && { start: filters.start }),
        ...(filters.end && { end: filters.end }),
      });
      const res = await fetch(`/api/admin/audit-logs?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load logs');
      const json = await res.json();
      setLogs(json?.data?.logs ?? []);
      setPagination(json?.data?.pagination ?? pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [pagination.currentPage, filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="px-3 py-2 border rounded" placeholder="Filter by action" value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })} />
          <input className="px-3 py-2 border rounded" placeholder="Filter by entity type" value={filters.entityType} onChange={e => setFilters({ ...filters, entityType: e.target.value })} />
          <input className="px-3 py-2 border rounded" placeholder="Filter by user email" value={filters.userEmail} onChange={e => setFilters({ ...filters, userEmail: e.target.value })} />
          <input className="px-3 py-2 border rounded" placeholder="Filter by entity id" value={filters.entityId} onChange={e => setFilters({ ...filters, entityId: e.target.value })} />
          <div className="flex items-center gap-2">
            <input type="date" className="px-3 py-2 border rounded w-full" value={filters.start} onChange={e => setFilters({ ...filters, start: e.target.value })} />
            <span className="text-sm text-gray-500">to</span>
            <input type="date" className="px-3 py-2 border rounded w-full" value={filters.end} onChange={e => setFilters({ ...filters, end: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Logs ({pagination.totalItems})</h2>
        </div>
        {loading ? (
          <div className="p-6">Loading…</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-gray-500">No logs</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium">Action</th>
                  <th className="px-4 py-2 text-left text-xs font-medium">Entity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium">Meta</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((l, i) => (
                  <tr key={l._id ?? i}>
                    <td className="px-4 py-2 text-sm">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">{l.action}</td>
                    <td className="px-4 py-2 text-sm">{l.entityType ?? '-'} {l.entityId ? `(${l.entityId})` : ''}</td>
                    <td className="px-4 py-2 text-sm">{l.userEmail ?? String(l.userId ?? '')}</td>
                    <td className="px-4 py-2 text-xs font-mono max-w-[320px] truncate" title={JSON.stringify(l.meta ?? {})}>{JSON.stringify(l.meta ?? {})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm">Page {pagination.currentPage} / {pagination.totalPages}</div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={!pagination.hasPreviousPage} onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}>Previous</button>
              <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={!pagination.hasNextPage} onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
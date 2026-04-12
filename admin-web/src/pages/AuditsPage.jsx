import { useCallback, useEffect, useState } from 'react';
import { fetchAudits } from '../apiClient.js';

export default function AuditsPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async (p) => {
    setErr('');
    setLoading(true);
    try {
      const res = await fetchAudits(p, 20);
      setItems(Array.isArray(res?.data) ? res.data : []);
      setPagination(res?.pagination || null);
    } catch (e) {
      setErr(e.message || 'Could not load audit log');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const totalPages = pagination?.totalPages ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">POI moderation audit log</h1>
      <p className="mt-1 text-sm text-slate-400">Every APPROVE / REJECT is recorded.</p>

      {err && (
        <div className="mt-4 rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
          {err}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-slate-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="mt-6 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-8 text-center text-slate-400">
          No audit entries yet.
        </p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Admin</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">POI</th>
                  <th className="px-4 py-3 font-medium">Status change</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {items.map((row) => (
                  <tr key={String(row.id)} className="hover:bg-slate-900/50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.admin?.email || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.action === 'APPROVE'
                            ? 'text-emerald-400'
                            : row.action === 'REJECT'
                              ? 'text-red-400'
                              : 'text-slate-400'
                        }
                      >
                        {row.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {row.poi?.code || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {row.previousStatus} → {row.newStatus}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-400" title={row.reason || ''}>
                      {row.reason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-600 px-3 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-slate-400">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-600 px-3 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

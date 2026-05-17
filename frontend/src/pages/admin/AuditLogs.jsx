import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { getAuditLogsApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Filter } from 'lucide-react';

const ACTION_COLORS = {
  GOAL_CREATED: 'bg-blue-100 text-blue-700',
  GOAL_SUBMITTED: 'bg-indigo-100 text-indigo-700',
  GOAL_APPROVED: 'bg-green-100 text-green-700',
  GOAL_REJECTED: 'bg-red-100 text-red-700',
  GOAL_EDITED: 'bg-yellow-100 text-yellow-700',
  GOAL_LOCKED: 'bg-purple-100 text-purple-700',
  GOAL_UNLOCKED: 'bg-orange-100 text-orange-700',
  QUARTERLY_UPDATED: 'bg-cyan-100 text-cyan-700',
  MANAGER_COMMENT_ADDED: 'bg-pink-100 text-pink-700',
  USER_CREATED: 'bg-teal-100 text-teal-700',
  USER_UPDATED: 'bg-sky-100 text-sky-700',
  LOGIN: 'bg-gray-100 text-gray-700',
};

const ACTION_LABELS = {
  GOAL_CREATED: '🆕 Goal Created',
  GOAL_SUBMITTED: '📤 Submitted',
  GOAL_APPROVED: '✅ Approved',
  GOAL_REJECTED: '❌ Rejected',
  GOAL_EDITED: '✏️ Edited',
  GOAL_LOCKED: '🔒 Locked',
  GOAL_UNLOCKED: '🔓 Unlocked',
  QUARTERLY_UPDATED: '📊 Q-Updated',
  MANAGER_COMMENT_ADDED: '💬 Comment',
  USER_CREATED: '👤 User Created',
  USER_UPDATED: '✏️ User Updated',
  USER_DELETED: '🗑️ User Deleted',
  LOGIN: '🔐 Login',
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => { fetchLogs(); }, [page, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (actionFilter) params.action = actionFilter;
      const { data } = await getAuditLogsApi(params);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (e) { toast.error('Failed to load audit logs'); }
    finally { setLoading(false); }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <Layout title="Audit Logs">
      <div className="space-y-5">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <strong>Audit Trail</strong> — Complete log of all actions performed in the system. Shows who did what, when, and what changed.
        </div>

        {/* Filters */}
        <div className="table-surface p-4 flex items-center gap-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
            <option value="">All Actions</option>
            {Object.keys(ACTION_LABELS).map(a => (
              <option key={a} value={a}>{ACTION_LABELS[a]}</option>
            ))}
          </select>
          <span className="ml-auto text-sm text-gray-500">{total} total records</span>
        </div>

        {/* Logs Table */}
        <div className="table-surface p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No audit logs found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-heading">
                      {['Timestamp', 'User', 'Role', 'Action', 'Description', 'Old Value', 'New Value'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log._id} className="table-row-hover border-b border-gray-50">
                        <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString()}<br />
                          <span className="text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {(log.userId?.name || log.userName || 'U').charAt(0)}
                            </div>
                            <p className="text-sm font-medium text-gray-900">{log.userId?.name || log.userName}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                            {log.userId?.role || log.userRole}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-sm text-gray-600 max-w-[200px]">
                          <p className="truncate">{log.description}</p>
                        </td>
                        <td className="py-3 pr-4">
                          {log.oldValue ? (
                            <div className="text-xs text-gray-400 bg-red-50 rounded px-2 py-1 max-w-[120px] truncate">
                              {JSON.stringify(log.oldValue).substring(0, 50)}
                            </div>
                          ) : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                        <td className="py-3">
                          {log.newValue ? (
                            <div className="text-xs text-gray-400 bg-green-50 rounded px-2 py-1 max-w-[120px] truncate">
                              {JSON.stringify(log.newValue).substring(0, 50)}
                            </div>
                          ) : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AuditLogs;

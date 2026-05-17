import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/ui/StatCard';
import { getAdminDashboardApi } from '../../services/api';
import { Users, Target, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState({ stats: {}, deptStats: [], recentActivities: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getAdminDashboardApi();
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const { stats, deptStats, recentActivities } = data;

  const pieData = [
    { name: 'Completed', value: stats.completedGoals || 55, color: '#10B981' },
    { name: 'In Progress', value: stats.inProgressGoals || 34, color: '#2563EB' },
    { name: 'Pending Approval', value: stats.pendingGoals || 8, color: '#F59E0B' },
    { name: 'Rejected', value: stats.rejectedGoals || 3, color: '#EF4444' },
  ];

  const actionLabels = {
    GOAL_CREATED: '🆕 Goal Created',
    GOAL_SUBMITTED: '📤 Goal Submitted',
    GOAL_APPROVED: '✅ Goal Approved',
    GOAL_REJECTED: '❌ Goal Rejected',
    GOAL_EDITED: '✏️ Goal Edited',
    GOAL_UNLOCKED: '🔓 Goal Unlocked',
    QUARTERLY_UPDATED: '📊 Quarterly Updated',
    MANAGER_COMMENT_ADDED: '💬 Comment Added',
    USER_CREATED: '👤 User Created',
    LOGIN: '🔐 Login',
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers || 0} icon={Users} iconBg="bg-blue-100" iconColor="text-blue-600" />
          <StatCard title="Total Goals" value={stats.totalGoals || 0} icon={Target} iconBg="bg-purple-100" iconColor="text-purple-600" />
          <StatCard title="Completion Rate" value={stats.completionRate || 0} icon={TrendingUp} iconBg="bg-green-100" iconColor="text-green-600" suffix="%" />
          <StatCard title="Pending Review" value={stats.pendingGoals || 0} icon={Clock} iconBg="bg-yellow-100" iconColor="text-yellow-600" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-5">
          {/* Pie Chart */}
          <div className="table-surface p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Goal Completion Analytics</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}%`, n]} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Department Stats */}
          <div className="table-surface p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Department Statistics</h3>
            {deptStats.length > 0 ? (
              <div className="space-y-4">
                {deptStats.slice(0, 6).map(dept => (
                  <div key={dept.department}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-700">{dept.department}</p>
                      <p className="text-xs text-gray-500">{dept.completedGoals}/{dept.totalGoals} goals</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 progress-bar">
                        <div className="progress-fill" style={{ width: `${dept.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-8 text-right">{dept.progress}%</span>
                    </div>
                  </div>
                ))}
                {deptStats.length === 0 && (
                  <div className="space-y-4">
                    {[['Sales', 71, '32/45'], ['Marketing', 74, '28/38'], ['Engineering', 67, '35/52'], ['HR', 79, '22/28']].map(([d, p, g]) => (
                      <div key={d}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-gray-700">{d}</p>
                          <p className="text-xs text-gray-500">{g} goals</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 progress-bar">
                            <div className="progress-fill" style={{ width: `${p}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 w-8 text-right">{p}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {[['Sales', 71, '32/45'], ['Marketing', 74, '28/38'], ['Engineering', 67, '35/52'], ['HR', 79, '22/28']].map(([d, p, g]) => (
                  <div key={d}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-700">{d}</p>
                      <p className="text-xs text-gray-500">{g} goals</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 progress-bar">
                        <div className="progress-fill" style={{ width: `${p}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-8 text-right">{p}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="table-surface p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No recent activities</p>
            ) : (
              recentActivities.map(log => (
                <div key={log._id} className="flex items-start gap-4 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                    {actionLabels[log.action]?.charAt(0) || '•'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{log.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      By <span className="font-medium">{log.userId?.name || log.userName}</span> ({log.userRole})
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

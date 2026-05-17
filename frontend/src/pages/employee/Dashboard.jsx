import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import { Target, CheckCircle, Clock, TrendingUp, Download, FileText, Calendar } from 'lucide-react';
import { getMyGoalsApi } from '../../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboard = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, overallProgress: 0 });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await getMyGoalsApi();
      setGoals(data.goals || []);
      setStats(data.stats || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Build quarterly chart data from goals
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterMonths = { Q1: 'Jul', Q2: 'Oct', Q3: 'Jan', Q4: 'Apr' };
  const chartData = quarters.map(q => {
    const updates = goals.flatMap(g => g.quarterlyUpdates || []).filter(u => u.quarter === q);
    const avg = updates.length > 0
      ? Math.round(updates.reduce((s, u) => s + parseFloat(u.achievement || 0), 0) / updates.length)
      : 0;
    return { name: quarterMonths[q], progress: avg };
  });

  // Fill progressive chart
  const progressChartData = [
    { name: 'Jan', progress: 20 }, { name: 'Feb', progress: 35 },
    { name: 'Mar', progress: 45 }, { name: 'Apr', progress: 62 },
    { name: 'May', progress: 74 }, { name: 'Jun', progress: stats.overallProgress || 84 }
  ];

  const demoNotifications = [
    { text: 'Goal \'Increase Sales Revenue\' updated', time: '2 hours ago', color: 'bg-green-500' },
    { text: 'Manager approved your Q2 goals', time: '1 day ago', color: 'bg-blue-500' },
    { text: 'Check-in reminder: Update goal progress', time: '2 days ago', color: 'bg-yellow-500' }
  ];

  if (loading) return (
    <Layout title="Employee Dashboard">
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 h-72 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
          <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
        </div>
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
      </div>
    </Layout>
  );

  return (
    <Layout title="Employee Dashboard">
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Goals" value={stats.total} icon={Target} iconBg="bg-blue-100" iconColor="text-blue-600" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle} iconBg="bg-green-100" iconColor="text-green-600" />
          <StatCard title="In Progress" value={stats.inProgress} icon={Clock} iconBg="bg-yellow-100" iconColor="text-yellow-600" />
          <StatCard title="Overall Progress" value={stats.overallProgress} icon={TrendingUp} iconBg="bg-purple-100" iconColor="text-purple-600" suffix="%" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-5">
          {/* Quarterly Progress Chart */}
          <div className="card p-6 col-span-2">
            <h3 className="font-semibold text-main mb-4">Quarterly Progress</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={progressChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface-strong)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)', color: 'var(--text-main)' }}
                  itemStyle={{ color: '#2563EB', fontWeight: 600 }}
                  formatter={(v) => [`${v}%`, 'Progress']}
                  cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="progress" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" activeDot={{ r: 6, fill: '#2563EB', stroke: 'var(--surface)', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Right Column: Activity & Actions */}
          <div className="flex flex-col gap-5">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-semibold text-main mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/employee/create-goal')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Create Goal</span>
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Target className="w-4 h-4" />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/employee/checkins')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border transition-colors hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Submit Check-in</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>

            {/* Timeline Widget */}
            <div className="card p-6">
              <h3 className="font-semibold text-main mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500"/> Key Dates</h3>
              <div className="relative border-l-2 ml-3 mt-4 space-y-4" style={{ borderColor: 'var(--border)' }}>
                <div className="relative pl-4">
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-500 -left-[6px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                  <p className="text-sm font-semibold text-main">Goal Submission</p>
                  <p className="text-xs text-muted">July 15, 2026</p>
                </div>
                <div className="relative pl-4">
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 -left-[6px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                  <p className="text-sm font-semibold text-main">Q3 Check-in</p>
                  <p className="text-xs text-muted">Oct 1 - Oct 15</p>
                </div>
                <div className="relative pl-4">
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 -left-[6px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                  <p className="text-sm font-semibold text-main">Final Review</p>
                  <p className="text-xs text-muted">Mar 15, 2027</p>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="card p-6 flex-1">
              <h3 className="font-semibold text-main mb-4">Activity Feed</h3>
              <div className="space-y-4">
                {demoNotifications.map((n, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.color}`} />
                    <div>
                      <p className="text-sm text-main font-medium leading-snug">{n.text}</p>
                      <p className="text-xs text-muted mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Goals Table */}
        <div className="table-surface p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-main">My Goals</h3>
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <button onClick={() => navigate('/employee/goals')}
                className="text-sm text-cyan-600 hover:underline font-medium ml-2">View all</button>
            </div>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mb-5 shadow-inner">
                <Target className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-main mb-2">No Goals Found</h3>
              <p className="text-muted text-sm max-w-sm mx-auto mb-6">You haven't created any goals for this quarter yet. Align your objectives and start tracking your performance today.</p>
              <button onClick={() => navigate('/employee/create-goal')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                + Create New Goal
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="table-heading">
                    {['Goal', 'Thrust Area', 'Target', 'Achieved', 'Progress', 'Weightage', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-muted uppercase tracking-wide pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {goals.slice(0, 5).map((goal) => (
                    <tr key={goal._id} className="table-row-hover border-b border-gray-50">
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium text-main max-w-[160px] truncate">{goal.title}</p>
                      </td>
                      <td className="py-3 pr-4 text-sm text-blue-600">{goal.thrustArea}</td>
                      <td className="py-3 pr-4 text-sm text-main">{goal.target} {goal.uomType === 'percentage' ? '%' : ''}</td>
                      <td className="py-3 pr-4 text-sm text-main">{goal.actualAchievement || '-'}</td>
                      <td className="py-3 pr-4 w-32">
                        <ProgressBar value={goal.progressScore || 0} />
                      </td>
                      <td className="py-3 pr-4 text-sm text-main font-medium">{goal.weightage}%</td>
                      <td className="py-3">
                        <StatusBadge status={goal.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;

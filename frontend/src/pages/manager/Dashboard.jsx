import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/ui/StatCard';
import { getTeamGoalsApi, getTeamOverviewApi } from '../../services/api';
import { Users, ClipboardList, CheckCircle, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({ teamMembers: 0, pendingApprovals: 0, goalsCompleted: 0, avgProgress: 0 });
  const [team, setTeam] = useState([]);
  const [recentGoals, setRecentGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [goalsRes, teamRes] = await Promise.all([getTeamGoalsApi(), getTeamOverviewApi()]);
      setStats(goalsRes.data.stats || {});
      setTeam(teamRes.data.team || []);
      // Recent check-ins = goals with manager comments
      const goalsWithComments = (goalsRes.data.goals || [])
        .filter(g => g.managerComments?.length > 0)
        .slice(0, 5);
      setRecentGoals(goalsWithComments);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const chartData = team.map(t => ({
    name: t.employee.name.split(' ')[0],
    progress: t.avgProgress
  }));

  return (
    <Layout title="Manager Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Team Members" value={stats.teamMembers} icon={Users} iconBg="bg-blue-100" iconColor="text-blue-600" />
          <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={ClipboardList} iconBg="bg-yellow-100" iconColor="text-yellow-600" />
          <StatCard title="Goals Completed" value={stats.goalsCompleted} icon={CheckCircle} iconBg="bg-green-100" iconColor="text-green-600" />
          <StatCard title="Team Average" value={stats.avgProgress || 0} icon={TrendingUp} iconBg="bg-purple-100" iconColor="text-purple-600" suffix="%" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-5">
          {/* Team Performance Chart */}
          <div className="table-surface p-6 col-span-2">
            <h3 className="font-semibold text-slate-900 mb-4">Team Performance Overview</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                    formatter={(v) => [`${v}%`, 'Progress']}
                  />
                  <Bar dataKey="progress" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-300 text-sm">
                No team data available
              </div>
            )}
          </div>

          {/* Recent Check-ins */}
          <div className="table-surface p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Recent Check-ins</h3>
            <div className="space-y-4">
              {recentGoals.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No recent check-in comments</p>
              ) : recentGoals.map(g => (
                <div key={g._id} className="border-b border-gray-50 pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">{g.employeeId?.name || 'Employee'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(g.managerComments[g.managerComments.length - 1]?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 mb-1.5">{g.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    💬 {g.managerComments[g.managerComments.length - 1]?.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Summary */}
        <div className="table-surface p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Team Summary</h3>
          <div className="grid grid-cols-1 gap-3">
            {team.map(({ employee, totalGoals, approvedGoals, avgProgress }) => (
              <div key={employee._id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {employee.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                  <p className="text-xs text-gray-400">{employee.department} • {approvedGoals}/{totalGoals} goals approved</p>
                </div>
                <div className="w-32">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${avgProgress}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 w-10 text-right">{avgProgress}%</span>
              </div>
            ))}
            {team.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">No team members assigned</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;

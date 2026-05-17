import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import Modal from '../../components/ui/Modal';
import { getMyGoalsApi, deleteGoalApi, submitGoalSheetApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Target, Edit, Trash2, Send, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data } = await getMyGoalsApi();
      setGoals(data.goals || []);
      setStats(data.stats || {});
    } catch (e) { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoalApi(id);
      toast.success('Goal deleted');
      setDeleteModal(null);
      fetchGoals();
    } catch (e) { toast.error(e.response?.data?.message || 'Cannot delete goal'); }
  };

  const handleSubmit = async () => {
    try {
      await submitGoalSheetApi({ cycle: '2024-25' });
      toast.success('Goals submitted for manager approval!');
      fetchGoals();
    } catch (e) { toast.error(e.response?.data?.message || 'Submission failed'); }
  };

  const draftGoals = goals.filter(g => g.status === 'draft');
  const totalDraftWeight = draftGoals.reduce((s, g) => s + g.weightage, 0);
  const submittedWeight = goals.filter(g => g.status !== 'draft').reduce((s, g) => s + g.weightage, 0);
  const canSubmit = draftGoals.length > 0 && (totalDraftWeight + submittedWeight) === 100;

  return (
    <Layout title="My Goals">
      <div className="space-y-6">
        {/* Action bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {goals.length} goal{goals.length !== 1 ? 's' : ''} •
            Total weightage: <span className={`font-semibold ${stats.total > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
              {goals.reduce((s, g) => s + g.weightage, 0)}%
            </span>
          </div>
          <div className="flex gap-3">
            {draftGoals.length > 0 && (
              <button onClick={handleSubmit} disabled={!canSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" />
                Submit for Approval ({canSubmit ? '100%' : `${totalDraftWeight + submittedWeight}%`})
              </button>
            )}
            <button onClick={() => navigate('/employee/create-goal')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
              + New Goal
            </button>
          </div>
        </div>

        {/* Goals Table */}
        <div className="table-surface p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-16">
              <Target className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No goals created yet</p>
              <p className="text-gray-400 text-sm mt-1">Start by creating your first goal for FY 2024-25</p>
              <button onClick={() => navigate('/employee/create-goal')}
                className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                Create First Goal
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-heading">
                    {['Goal Title', 'Thrust Area', 'UOM', 'Target', 'Achieved', 'Progress', 'Weightage', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {goals.map((goal) => (
                    <tr key={goal._id} className="table-row-hover border-b border-gray-50">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2">
                          {goal.isLocked && <Lock className="w-3.5 h-3.5 text-purple-400" />}
                          <p className="text-sm font-medium text-gray-900 max-w-[150px] truncate">{goal.title}</p>
                        </div>
                        {goal.rejectionReason && (
                          <p className="text-xs text-red-500 mt-0.5">↩ {goal.rejectionReason}</p>
                        )}
                      </td>
                      <td className="py-3.5 pr-3 text-sm text-blue-600">{goal.thrustArea}</td>
                      <td className="py-3.5 pr-3 text-xs text-gray-500 capitalize">{goal.uomType}</td>
                      <td className="py-3.5 pr-3 text-sm text-gray-700">{goal.target}</td>
                      <td className="py-3.5 pr-3 text-sm text-gray-700">{goal.actualAchievement || '—'}</td>
                      <td className="py-3.5 pr-3 w-28">
                        <ProgressBar value={goal.progressScore || 0} />
                      </td>
                      <td className="py-3.5 pr-3 text-sm font-semibold text-gray-700">{goal.weightage}%</td>
                      <td className="py-3.5 pr-3">
                        <StatusBadge status={goal.status} />
                      </td>
                      <td className="py-3.5">
                        <div className="flex gap-1">
                          {(goal.status === 'draft' || goal.status === 'rejected') && (
                            <>
                              <button
                                onClick={() => navigate(`/employee/create-goal?edit=${goal._id}`)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteModal(goal._id)}
                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Goal" size="sm">
        <p className="text-gray-600 text-sm mb-6">Are you sure you want to delete this goal? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(null)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => handleDelete(deleteModal)}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </Layout>
  );
};

export default Goals;

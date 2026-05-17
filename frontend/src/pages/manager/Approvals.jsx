import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import Modal from '../../components/ui/Modal';
import { getTeamGoalsApi, approveGoalApi, rejectGoalApi, addCommentApi, editGoalInlineApi, getCommentsApi } from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, MessageSquare, Edit2, ChevronDown } from 'lucide-react';

const Approvals = () => {
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState('submitted');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [commentModal, setCommentModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [comments, setComments] = useState([]);
  const [reason, setReason] = useState('');
  const [commentForm, setCommentForm] = useState({ quarter: 'Q1', comment: '', rating: '' });
  const [editForm, setEditForm] = useState({ target: '', weightage: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchGoals(); }, [filter]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await getTeamGoalsApi(params);
      setGoals(data.goals || []);
    } catch (e) { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      await approveGoalApi(id);
      toast.success('Goal approved and locked!');
      fetchGoals();
    } catch (e) { toast.error(e.response?.data?.message || 'Approval failed'); }
  };

  const handleReject = async () => {
    if (!reason) { toast.error('Please provide a reason'); return; }
    setSaving(true);
    try {
      await rejectGoalApi(rejectModal, { reason });
      toast.success('Goal returned for rework');
      setRejectModal(null);
      setReason('');
      fetchGoals();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const openCommentModal = async (goal) => {
    setCommentModal(goal);
    try {
      const { data } = await getCommentsApi(goal._id);
      setComments(data.comments || []);
    } catch (e) {}
  };

  const handleAddComment = async () => {
    if (!commentForm.comment) { toast.error('Please enter a comment'); return; }
    setSaving(true);
    try {
      await addCommentApi(commentModal._id, commentForm);
      toast.success('Check-in comment added!');
      setCommentModal(null);
      setCommentForm({ quarter: 'Q1', comment: '', rating: '' });
      fetchGoals();
    } catch (e) { toast.error('Failed to add comment'); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      await editGoalInlineApi(editModal._id, editForm);
      toast.success('Goal updated');
      setEditModal(null);
      fetchGoals();
    } catch (e) { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const filterOptions = [
    { value: 'submitted', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Returned' },
    { value: 'all', label: 'All Goals' },
  ];

  return (
    <Layout title="Goal Approvals">
      <div className="space-y-6">
        {/* Filter tabs */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          {filterOptions.map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === opt.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Goals */}
        <div className="table-surface p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No goals in this category</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-heading">
                    {['Employee', 'Goal', 'Thrust Area', 'Target', 'Achievement', 'Progress', 'Weightage', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {goals.map(goal => (
                    <tr key={goal._id} className="table-row-hover border-b border-gray-50">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {goal.employeeId?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{goal.employeeId?.name}</p>
                            <p className="text-xs text-gray-400">{goal.employeeId?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3">
                        <p className="text-sm font-medium text-gray-900 max-w-[160px] truncate">{goal.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{goal.uomType}</p>
                      </td>
                      <td className="py-3.5 pr-3 text-sm text-blue-600">{goal.thrustArea}</td>
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
                        <div className="flex gap-1.5">
                          {goal.status === 'submitted' && (
                            <>
                              <button onClick={() => handleApprove(goal._id)}
                                title="Approve"
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button onClick={() => { setRejectModal(goal._id); setReason(''); }}
                                title="Reject"
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <XCircle className="w-5 h-5" />
                              </button>
                              <button onClick={() => { setEditModal(goal); setEditForm({ target: goal.target, weightage: goal.weightage }); }}
                                title="Edit"
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button onClick={() => openCommentModal(goal)}
                            title="Add check-in comment"
                            className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors">
                            <MessageSquare className="w-5 h-5" />
                          </button>
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

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Return Goal for Rework" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Provide a reason for returning this goal. The employee will be notified.</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="e.g. Target needs to be more specific. Please revise and resubmit."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-3">
            <button onClick={() => setRejectModal(null)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
            <button onClick={handleReject} disabled={saving}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-60">
              {saving ? 'Returning...' : 'Return for Rework'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Comment Modal */}
      <Modal isOpen={!!commentModal} onClose={() => setCommentModal(null)} title="Check-in Comment" size="md">
        {commentModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-gray-900">{commentModal.title}</p>
              <p className="text-xs text-gray-500">{commentModal.employeeId?.name}</p>
            </div>

            {comments.length > 0 && (
              <div className="border border-gray-100 rounded-xl p-4 max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-500 mb-3">PREVIOUS COMMENTS</p>
                {comments.map(c => (
                  <div key={c._id} className="mb-3 pb-3 border-b border-gray-50 last:border-0">
                    <div className="flex justify-between">
                      <p className="text-xs font-medium text-blue-600">{c.quarter}</p>
                      <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{c.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quarter</label>
                <select value={commentForm.quarter} onChange={(e) => setCommentForm({ ...commentForm, quarter: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating (1-5)</label>
                <input type="number" min="1" max="5" value={commentForm.rating}
                  onChange={(e) => setCommentForm({ ...commentForm, rating: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment *</label>
              <textarea value={commentForm.comment}
                onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                rows={4} placeholder="Add your structured check-in feedback..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCommentModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
              <button onClick={handleAddComment} disabled={saving}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Comment'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Goal (Inline)" size="sm">
        {editModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-gray-900">{editModal.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target</label>
              <input value={editForm.target} onChange={(e) => setEditForm({ ...editForm, target: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Weightage (%)</label>
              <input type="number" value={editForm.weightage} onChange={(e) => setEditForm({ ...editForm, weightage: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
              <button onClick={handleEdit} disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Approvals;

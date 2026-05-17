import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import ProgressBar from '../../components/ui/ProgressBar';
import Modal from '../../components/ui/Modal';
import { getTeamGoalsApi, addCommentApi, getCommentsApi } from '../../services/api';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';

const ManagerCheckIns = () => {
  const [goals, setGoals] = useState([]);
  const [selectedQ, setSelectedQ] = useState('Q1');
  const [commentModal, setCommentModal] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ comment: '', rating: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await getTeamGoalsApi({ status: 'approved' });
      setGoals(data.goals || []);
    } catch (e) { } finally { setLoading(false); }
  };

  const openCommentModal = async (goal) => {
    setCommentModal(goal);
    try {
      const { data } = await getCommentsApi(goal._id);
      setComments(data.comments || []);
    } catch (e) { }
  };

  const handleSaveComment = async () => {
    if (!commentForm.comment) { toast.error('Please enter a comment'); return; }
    setSaving(true);
    try {
      await addCommentApi(commentModal._id, { quarter: selectedQ, ...commentForm });
      toast.success('Check-in comment saved!');
      setCommentModal(null);
      setCommentForm({ comment: '', rating: '' });
    } catch (e) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <Layout title="Team Check-ins">
      <div className="space-y-6">
        {/* Quarter tabs */}
        <div className="flex gap-2">
          {QUARTERS.map(q => (
            <button key={q} onClick={() => setSelectedQ(q)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedQ === q ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-cyan-300'
              }`}>
              {q}
            </button>
          ))}
        </div>

        <div className="table-surface p-6">
          <h3 className="font-semibold text-slate-900 mb-5">{selectedQ} — Planned vs Actual</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-heading">
                    {['Employee', 'Goal', 'Target', `${selectedQ} Achievement`, 'Progress', 'Weightage', 'Action'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {goals.map(goal => {
                    const qUpdate = goal.quarterlyUpdates?.find(q => q.quarter === selectedQ);
                    return (
                      <tr key={goal._id} className="table-row-hover border-b border-gray-50">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {goal.employeeId?.name?.charAt(0)}
                            </div>
                            <p className="text-sm font-medium text-slate-900">{goal.employeeId?.name}</p>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          <p className="text-sm font-medium text-slate-900 max-w-[140px] truncate">{goal.title}</p>
                          <p className="text-xs text-blue-600">{goal.thrustArea}</p>
                        </td>
                        <td className="py-3.5 pr-4 text-sm text-slate-700">{goal.target}</td>
                        <td className="py-3.5 pr-4">
                          {qUpdate ? (
                            <span className="text-sm font-semibold text-slate-900">{qUpdate.achievement}</span>
                          ) : <span className="text-sm text-slate-300">Not updated</span>}
                        </td>
                        <td className="py-3.5 pr-4 w-28">
                          <ProgressBar value={goal.progressScore || 0} />
                        </td>
                        <td className="py-3.5 pr-4 text-sm font-semibold text-slate-700">{goal.weightage}%</td>
                        <td className="py-3.5">
                          <button onClick={() => openCommentModal(goal)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Comment
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {goals.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                        No approved goals found for check-in
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Comment Modal */}
      <Modal isOpen={!!commentModal} onClose={() => setCommentModal(null)} title={`${selectedQ} Check-in Comment`}>
        {commentModal && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-sm font-semibold text-slate-900">{commentModal.title}</p>
              <p className="text-xs text-slate-500">{commentModal.employeeId?.name}</p>
            </div>
            {comments.length > 0 && (
              <div className="border rounded-xl p-3 max-h-36 overflow-y-auto space-y-2">
                <p className="text-xs font-semibold text-slate-400">PREVIOUS COMMENTS</p>
                {comments.map(c => (
                  <div key={c._id} className="text-sm text-slate-700 border-b pb-2 last:border-0">
                    <span className="text-xs text-cyan-600 font-medium">{c.quarter}: </span>
                    {c.comment}
                  </div>
                ))}
              </div>
            )}
            <textarea value={commentForm.comment}
              onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
              rows={4} placeholder="Enter your structured check-in feedback..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <input type="number" min="1" max="5" value={commentForm.rating}
              onChange={(e) => setCommentForm({ ...commentForm, rating: e.target.value })}
              placeholder="Rating 1-5 (optional)"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex gap-3">
              <button onClick={() => setCommentModal(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600">Cancel</button>
              <button onClick={handleSaveComment} disabled={saving}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Comment'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ManagerCheckIns;

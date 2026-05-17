import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { getMyGoalsApi, updateQuarterlyApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Edit } from 'lucide-react';

const QUARTERS = [
  { key: 'Q1', label: 'Q1 Check-in', period: 'July 2024', desc: 'April – June' },
  { key: 'Q2', label: 'Q2 Check-in', period: 'October 2024', desc: 'July – September' },
  { key: 'Q3', label: 'Q3 Check-in', period: 'January 2025', desc: 'October – December' },
  { key: 'Q4', label: 'Q4 / Annual', period: 'March–April 2025', desc: 'Full year review' },
];

const CheckIns = () => {
  const [goals, setGoals] = useState([]);
  const [selectedQ, setSelectedQ] = useState('Q1');
  const [updateModal, setUpdateModal] = useState(null);
  const [form, setForm] = useState({ actualAchievement: '', status: 'on_track', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await getMyGoalsApi();
      setGoals((data.goals || []).filter(g => g.status === 'approved' || g.status === 'locked'));
    } catch (e) { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  const openUpdateModal = (goal) => {
    const existing = goal.quarterlyUpdates?.find(q => q.quarter === selectedQ);
    setForm({
      actualAchievement: existing?.achievement || '',
      status: existing?.status || 'on_track',
      notes: existing?.notes || ''
    });
    setUpdateModal(goal);
  };

  const handleSave = async () => {
    if (!form.actualAchievement) { toast.error('Please enter actual achievement'); return; }
    setSaving(true);
    try {
      await updateQuarterlyApi(updateModal._id, { ...form, quarter: selectedQ });
      toast.success(`${selectedQ} achievement updated!`);
      setUpdateModal(null);
      fetchGoals();
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <Layout title="Quarterly Check-ins">
      <div className="space-y-6">
        {/* Quarter selector */}
        <div className="grid grid-cols-4 gap-3">
          {QUARTERS.map(q => (
            <button
              key={q.key}
              onClick={() => setSelectedQ(q.key)}
              className={`card p-4 text-left transition-all ${selectedQ === q.key ? 'border-2 border-cyan-500 bg-cyan-50/70' : 'hover:shadow-lg'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className={`w-4 h-4 ${selectedQ === q.key ? 'text-cyan-600' : 'text-slate-400'}`} />
                <p className={`font-semibold text-sm ${selectedQ === q.key ? 'text-cyan-700' : 'text-slate-700'}`}>{q.label}</p>
              </div>
              <p className="text-xs text-slate-500">{q.desc}</p>
              <p className="text-xs text-slate-400 mt-0.5">{q.period}</p>
            </button>
          ))}
        </div>

        {/* Goals Check-in Table */}
        <div className="table-surface p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">
              {QUARTERS.find(q => q.key === selectedQ)?.label} — Update Achievements
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No approved goals for check-in. Get your goals approved first.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-heading">
                    {['Goal', 'Thrust Area', 'Target', selectedQ + ' Achievement', 'Progress', 'Status', ''].map(h => (
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
                          <p className="text-sm font-medium text-slate-900">{goal.title}</p>
                          <p className="text-xs text-slate-400 capitalize mt-0.5">{goal.uomType}</p>
                        </td>
                        <td className="py-3.5 pr-4 text-sm text-blue-600">{goal.thrustArea}</td>
                        <td className="py-3.5 pr-4 text-sm text-slate-700">{goal.target}</td>
                        <td className="py-3.5 pr-4 text-sm text-slate-700">
                          {qUpdate ? (
                            <span className="font-semibold text-slate-900">{qUpdate.achievement}</span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-3.5 pr-4 w-32">
                          <ProgressBar value={goal.progressScore || 0} />
                        </td>
                        <td className="py-3.5 pr-4">
                          {qUpdate ? <StatusBadge status={qUpdate.status} /> : <StatusBadge status="not_started" />}
                        </td>
                        <td className="py-3.5">
                          <button onClick={() => openUpdateModal(goal)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Update Modal */}
      <Modal isOpen={!!updateModal} onClose={() => setUpdateModal(null)} title={`Update ${selectedQ} Achievement`}>
        {updateModal && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-900">{updateModal.title}</p>
              <p className="text-xs text-slate-500 mt-1">Target: {updateModal.target}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Actual Achievement *</label>
              <input
                value={form.actualAchievement}
                onChange={(e) => setForm({ ...form, actualAchievement: e.target.value })}
                placeholder={`Enter ${updateModal.uomType === 'percentage' ? 'percentage' : 'value'} achieved`}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: 'not_started', l: 'Not Started', color: 'gray' },
                  { v: 'on_track', l: 'On Track', color: 'blue' },
                  { v: 'completed', l: 'Completed', color: 'green' }
                ].map(s => (
                  <button
                    key={s.v}
                    onClick={() => setForm({ ...form, status: s.v })}
                    className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                      form.status === s.v
                        ? s.v === 'completed' ? 'border-green-500 bg-green-50 text-green-700'
                          : s.v === 'on_track' ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-400 bg-gray-100 text-gray-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {s.l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Add any context or notes about progress..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setUpdateModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Achievement'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default CheckIns;

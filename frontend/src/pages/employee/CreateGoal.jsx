import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { createGoalApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Target, Info, PlusCircle, Trash2 } from 'lucide-react';

const THRUST_AREAS = ['Sales', 'Marketing', 'Operations', 'Customer Service', 'Learning & Development',
  'Finance', 'Product', 'Engineering', 'HR', 'Strategy'];

const UOM_TYPES = [
  { value: 'numeric', label: 'Numeric', desc: 'Count based (e.g. number of deals)' },
  { value: 'percentage', label: 'Percentage', desc: 'Progress in % (e.g. CSAT score)' },
  { value: 'timeline', label: 'Timeline', desc: 'Completion by a date' },
  { value: 'zero-based', label: 'Zero-based', desc: 'Binary: 0 is full score' }
];

const emptyGoal = { thrustArea: '', title: '', description: '', uomType: 'numeric', target: '', targetDate: '', weightage: '' };

const CreateGoal = () => {
  const [goals, setGoals] = useState([{ ...emptyGoal }]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const totalWeightage = goals.reduce((s, g) => s + (Number(g.weightage) || 0), 0);

  const updateGoal = (idx, field, value) => {
    setGoals(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  const addGoal = () => {
    if (goals.length >= 8) { toast.error('Maximum 8 goals allowed'); return; }
    setGoals(prev => [...prev, { ...emptyGoal }]);
  };

  const removeGoal = (idx) => {
    if (goals.length === 1) { toast.error('At least one goal is required'); return; }
    setGoals(prev => prev.filter((_, i) => i !== idx));
  };

  const validateGoals = () => {
    for (let i = 0; i < goals.length; i++) {
      const g = goals[i];
      if (!g.thrustArea) { toast.error(`Goal ${i + 1}: Thrust area required`); return false; }
      if (!g.title.trim()) { toast.error(`Goal ${i + 1}: Title required`); return false; }
      if (!g.description.trim()) { toast.error(`Goal ${i + 1}: Description required`); return false; }
      if (!g.target.trim()) { toast.error(`Goal ${i + 1}: Target required`); return false; }
      if (!g.weightage || Number(g.weightage) < 10) { toast.error(`Goal ${i + 1}: Minimum weightage is 10%`); return false; }
    }
    if (totalWeightage !== 100) {
      toast.error(`Total weightage must be exactly 100% (currently ${totalWeightage}%)`);
      return false;
    }
    return true;
  };

  const handleSaveDraft = async (idx) => {
    const g = goals[idx];
    if (!g.title || !g.thrustArea || !g.target || !g.weightage) {
      toast.error('Please fill required fields'); return;
    }
    setLoading(true);
    try {
      await createGoalApi({ ...g, cycle: '2024-25' });
      toast.success('Goal saved as draft!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save goal');
    } finally { setLoading(false); }
  };

  const handleSubmitAll = async () => {
    if (!validateGoals()) return;
    setSubmitting(true);
    try {
      for (const g of goals) {
        await createGoalApi({ ...g, cycle: '2024-25' });
      }
      const { submitGoalSheetApi } = await import('../../services/api');
      await submitGoalSheetApi({ cycle: '2024-25' });
      toast.success('All goals submitted for manager review!');
      navigate('/employee/goals');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  return (
    <Layout title="Create New Goal">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Goal</h2>
            <p className="text-sm text-gray-500">Define your goals for the quarter • FY 2024-25</p>
          </div>
          <div className="ml-auto text-right">
            <p className={`text-2xl font-bold ${totalWeightage === 100 ? 'text-green-600' : totalWeightage > 100 ? 'text-red-600' : 'text-gray-900'}`}>
              {totalWeightage}%
            </p>
            <p className="text-xs text-gray-400">Total Weightage</p>
          </div>
        </div>

        {/* Rules Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <strong>Validation Rules:</strong> Total weightage must equal 100% • Min 10% per goal • Max 8 goals per cycle
          </div>
        </div>

        {/* Goal Forms */}
        <div className="space-y-4">
          {goals.map((goal, idx) => (
            <div key={idx} className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {idx + 1}
                  </div>
                  <h3 className="font-semibold text-slate-900">Goal {idx + 1}</h3>
                </div>
                {goals.length > 1 && (
                  <button onClick={() => removeGoal(idx)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Thrust Area */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Thrust Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={goal.thrustArea}
                    onChange={(e) => updateGoal(idx, 'thrustArea', e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white"
                  >
                    <option value="">Select thrust area</option>
                    {THRUST_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                {/* Goal Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Goal Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={goal.title}
                    onChange={(e) => updateGoal(idx, 'title', e.target.value)}
                    placeholder="Enter a clear and concise goal title"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={goal.description}
                    onChange={(e) => updateGoal(idx, 'description', e.target.value)}
                    rows={3}
                    placeholder="Describe the goal, what you plan to achieve, and how you'll measure success"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white resize-none"
                  />
                </div>

                {/* UOM Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Unit of Measurement <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {UOM_TYPES.map(u => (
                      <button
                        key={u.value}
                        type="button"
                        onClick={() => updateGoal(idx, 'uomType', u.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                          goal.uomType === u.value
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <p className="font-semibold">{u.label}</p>
                        <p className="text-slate-400 mt-0.5 text-[10px]">{u.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target + Date */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Target <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={goal.target}
                      onChange={(e) => updateGoal(idx, 'target', e.target.value)}
                      placeholder={goal.uomType === 'percentage' ? '95' : goal.uomType === 'timeline' ? 'Milestone' : '100000'}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  {goal.uomType === 'timeline' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Date</label>
                      <input
                        type="date"
                        value={goal.targetDate}
                        onChange={(e) => updateGoal(idx, 'targetDate', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Weightage (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="10" max="100"
                      value={goal.weightage}
                      onChange={(e) => updateGoal(idx, 'weightage', e.target.value)}
                      placeholder="Min 10%"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button onClick={() => handleSaveDraft(idx)} disabled={loading}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Save as Draft
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Goal / Submit */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={addGoal} disabled={goals.length >= 8}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-cyan-300 text-cyan-600 rounded-xl text-sm font-medium hover:bg-cyan-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <PlusCircle className="w-4 h-4" />
            Add Another Goal ({goals.length}/8)
          </button>

          <div className="flex gap-3">
            <button onClick={() => navigate('/employee/goals')}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">
              Cancel
            </button>
            <button
              onClick={handleSubmitAll}
              disabled={submitting || totalWeightage !== 100}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-cyan-200"
            >
              {submitting ? 'Submitting...' : `Submit Goal Sheet (${totalWeightage}%)`}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateGoal;

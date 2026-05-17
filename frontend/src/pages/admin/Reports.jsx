import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import { getReportApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Download, Filter } from 'lucide-react';

const Reports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', quarter: '', department: '' });

  useEffect(() => { fetchReport(); }, [filters]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.quarter) params.quarter = filters.quarter;
      if (filters.department) params.department = filters.department;
      const res = await getReportApi(params);
      setData(res.data.data || []);
    } catch (e) { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (data.length === 0) { toast.error('No data to export'); return; }
    const headers = ['Employee', 'Manager', 'Department', 'Goal', 'Thrust Area', 'UOM', 'Target', 'Achievement', 'Progress%', 'Weightage', 'Status', 'Quarter', 'Cycle'];
    const rows = data.map(r => [
      r.employeeName, r.managerName, r.department, r.goalTitle, r.thrustArea,
      r.uomType, r.target, r.actualAchievement, r.progressScore + '%',
      r.weightage + '%', r.status, r.quarter, r.cycle
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atomalign-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported!');
  };

  return (
    <Layout title="Achievement Reports">
      <div className="space-y-5">
        {/* Filters */}
        <div className="table-surface p-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
            <option value="">All Status</option>
            {['draft', 'submitted', 'approved', 'rejected'].map(s => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select value={filters.quarter} onChange={(e) => setFilters({ ...filters, quarter: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
            <option value="">All Quarters</option>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
            <option value="">All Departments</option>
            {['Sales', 'Marketing', 'Operations', 'Engineering', 'HR', 'Finance'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <div className="ml-auto">
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Records', value: data.length, color: 'text-slate-900' },
            { label: 'Avg Progress', value: data.length > 0 ? Math.round(data.reduce((s, r) => s + r.progressScore, 0) / data.length) + '%' : '0%', color: 'text-cyan-600' },
            { label: 'Approved Goals', value: data.filter(r => r.status === 'approved').length, color: 'text-emerald-600' },
            { label: 'Pending', value: data.filter(r => r.status === 'submitted').length, color: 'text-amber-600' },
          ].map(item => (
            <div key={item.label} className="table-surface p-4 text-center">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-slate-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Report Table */}
        <div className="table-surface p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No data for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-heading">
                    {['Employee', 'Manager', 'Dept', 'Goal', 'Target', 'Achievement', 'Progress', 'Weightage', 'Status', 'Quarter'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 pr-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="table-row-hover border-b border-gray-50">
                      <td className="py-3 pr-3 font-medium text-gray-900">{row.employeeName}</td>
                      <td className="py-3 pr-3 text-gray-500">{row.managerName}</td>
                      <td className="py-3 pr-3 text-gray-500">{row.department}</td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-gray-900 max-w-[140px] truncate">{row.goalTitle}</p>
                        <p className="text-xs text-blue-600">{row.thrustArea}</p>
                      </td>
                      <td className="py-3 pr-3 text-gray-700">{row.target}</td>
                      <td className="py-3 pr-3 text-gray-700">{row.actualAchievement}</td>
                      <td className="py-3 pr-3 w-24">
                        <ProgressBar value={row.progressScore} />
                      </td>
                      <td className="py-3 pr-3 font-semibold text-gray-700">{row.weightage}%</td>
                      <td className="py-3 pr-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="py-3 pr-3 text-gray-500">{row.quarter}</td>
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

export default Reports;

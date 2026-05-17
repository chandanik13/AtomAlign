import { CheckCircle2, Clock, XCircle, Lock, AlertCircle, PlayCircle, FileEdit, CheckCircle } from 'lucide-react';

const statusMap = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', icon: FileEdit },
  submitted: { label: 'Pending', color: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50', icon: Clock },
  pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50', icon: XCircle },
  locked: { label: 'Locked', color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50', icon: Lock },
  in_progress: { label: 'In Progress', color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50', icon: PlayCircle },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50', icon: CheckCircle2 },
  not_started: { label: 'Not Started', color: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700', icon: AlertCircle },
  on_track: { label: 'On Track', color: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900/50', icon: CheckCircle2 },
};

const StatusBadge = ({ status }) => {
  const s = statusMap[status?.toLowerCase()] || statusMap.draft;
  const Icon = s.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.color} transition-colors`}>
      <Icon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  );
};

export default StatusBadge;

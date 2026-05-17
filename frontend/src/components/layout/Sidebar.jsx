import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtomLogo from '../ui/AtomLogo';
import {
  LayoutDashboard, Target, Users, BarChart2, FileText,
  CheckSquare, LogOut, Shield, Settings, ClipboardList, X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeNav = [
    { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employee/create-goal', icon: Target, label: 'Create Goal' },
    { to: '/employee/goals', icon: ClipboardList, label: 'My Goals' },
    { to: '/employee/checkins', icon: CheckSquare, label: 'Check-ins' },
  ];

  const managerNav = [
    { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/manager/approvals', icon: ClipboardList, label: 'Goal Approvals' },
    { to: '/manager/checkins', icon: CheckSquare, label: 'Check-ins' },
  ];

  const adminNav = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
    { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
  ];

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'manager' ? managerNav : employeeNav;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside style={{ width: '260px', minWidth: '260px' }}
        className={`fixed md:sticky top-0 h-screen flex flex-col bg-slate-950 text-slate-100 shadow-2xl shadow-slate-950/20 overflow-hidden z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        <div className="relative overflow-hidden px-5 py-6 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-700">
          <button className="absolute top-4 right-4 md:hidden p-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute -right-10 top-8 w-44 h-44 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -left-10 bottom-10 w-44 h-44 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-3xl bg-white/10 flex items-center justify-center shadow-lg shadow-slate-950/20">
            <AtomLogo size={26} color="#FFFFFF" />
          </div>
          <div>
            <p className="font-semibold text-white text-base leading-tight">AtomAlign</p>
            <p className="text-xs text-slate-300">Goal Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-3xl transition-all duration-200 ${
                isActive
                  ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-white'}`} />
                <span>{label}</span>
                {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-cyan-300" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-slate-800/70 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 text-sm font-semibold shadow-lg shadow-cyan-500/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-300 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-3xl border border-white/15 bg-white/10 px-3 py-3 text-sm font-medium text-white transition hover:bg-white/15"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;

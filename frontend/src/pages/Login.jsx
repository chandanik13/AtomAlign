import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AtomLogo from '../components/ui/AtomLogo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Already logged in
  if (user) {
    const redirect = { employee: '/employee/dashboard', manager: '/manager/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={redirect[user.role] || '/login'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      const redirect = { employee: '/employee/dashboard', manager: '/manager/dashboard', admin: '/admin/dashboard' };
      navigate(redirect[loggedUser.role] || '/login');
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your email and password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      employee: { email: 'employee@atomalign.com', password: 'password123' },
      manager: { email: 'manager@atomalign.com', password: 'password123' },
      admin: { email: 'admin@atomalign.com', password: 'password123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Centered Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-10 mx-4 rounded-[2rem] bg-white/10 border border-white/20 backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.4)] animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-xl shadow-cyan-500/30 mb-4">
            <AtomLogo size={32} color="#FFFFFF" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">AtomAlign</h1>
          <p className="text-slate-300 text-sm">Align goals and track performance.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@atomalign.com"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 p-[1px] group overflow-hidden mt-8"
          >
            <div className="bg-slate-900/40 rounded-2xl px-4 py-3.5 transition-all group-hover:bg-transparent flex items-center justify-center gap-2 text-white font-semibold shadow-lg shadow-cyan-500/20">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In Securely <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></>
              )}
            </div>
          </button>
        </form>

        <div className="mt-8">
          <p className="text-center text-xs font-medium text-slate-400 mb-4 uppercase tracking-widest">Demo Access</p>
          <div className="flex gap-3 justify-center">
            {['employee', 'manager', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => fillDemo(role)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white capitalize"
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, Sun, Moon, Monitor, User as UserIcon, Settings, LogOut, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotificationsApi, markAllReadApi } from '../../services/api';
import SearchModal from '../ui/SearchModal';

const Header = ({ title, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? '' : theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotificationsApi();
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadApi();
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins || 1} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} ago`;
  };

  const notifColors = {
    goal_approved: 'bg-green-500',
    goal_rejected: 'bg-red-500',
    goal_submitted: 'bg-blue-500',
    check_in_reminder: 'bg-yellow-500',
    manager_comment: 'bg-purple-500',
    default: 'bg-gray-400'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b backdrop-blur-xl px-8 py-3 shadow-sm transition-colors flex items-center justify-between gap-6"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 -ml-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors" onClick={onMenuClick}>
          <Menu className="w-5 h-5" style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-xl font-semibold transition-colors min-w-max hidden sm:block" style={{ color: 'var(--text-main)' }}>{title}</h1>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative group cursor-pointer" onClick={() => setShowSearchModal(true)}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            readOnly
            placeholder="Search goals, employees, reports..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm cursor-pointer"
            style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
            <kbd className="px-2 py-1 rounded text-[10px] font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}>Click to search</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-[0.6rem] font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-14 w-80 bg-white rounded-3xl shadow-xl border border-slate-200 z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                  <p className="font-semibold text-slate-900">Notifications</p>
                  {unread > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-cyan-600 hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-6">No notifications</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div key={n._id}
                        className={`flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 ${!n.isRead ? 'bg-sky-50/70' : ''}`}>
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notifColors[n.type] || notifColors.default}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative pl-4 border-l transition-colors" style={{ borderColor: 'var(--border)' }} ref={profileRef}>
            <button 
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowThemeMenu(false); }}
              className="flex items-center gap-3 text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-cyan-200/30">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight transition-colors" style={{ color: 'var(--text-main)' }}>{user?.name}</p>
                <p className="text-xs transition-colors capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 ml-1 hidden sm:block transition-colors" style={{ color: 'var(--text-muted)' }} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-14 w-56 rounded-3xl shadow-xl border z-50 animate-fade-in py-2 overflow-hidden"
                   style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="px-4 py-3 border-b mb-1" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>{user?.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email || 'Logged in'}</p>
                </div>
                
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--text-main)' }}>
                  <UserIcon className="w-4 h-4" /> My Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--text-main)' }}>
                  <Settings className="w-4 h-4" /> Settings
                </button>
                
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowThemeMenu(!showThemeMenu); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--text-main)' }}
                  >
                    <div className="flex items-center gap-3">
                      {theme === 'light' && <Sun className="w-4 h-4" />}
                      {theme === 'dark' && <Moon className="w-4 h-4" />}
                      {theme === 'dim' && <Monitor className="w-4 h-4" />}
                      <span>Theme</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showThemeMenu && (
                    <div className="bg-black/5 mx-2 rounded-xl py-1 my-1 overflow-hidden">
                      {['light', 'dark', 'dim'].map((t) => (
                        <button
                          key={t}
                          onClick={() => { setTheme(t); setShowThemeMenu(false); setShowProfileMenu(false); }}
                          className={`w-full flex items-center gap-3 px-8 py-2 text-sm hover:bg-black/5 transition-colors capitalize ${theme === t ? 'font-semibold' : ''}`}
                          style={{ color: 'var(--text-main)' }}
                        >
                          {t === 'dim' ? 'Mid' : t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t mt-1 pt-1" style={{ borderColor: 'var(--border)' }}>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </header>
  );
};

export default Header;

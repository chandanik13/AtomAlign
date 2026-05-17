import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Search, Filter, Target, Users, BarChart2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'users', label: 'Employees', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query) return;
    // For demo purposes, we'll just navigate to the respective pages 
    // or show a toast if it's a specific search
    if (activeFilter === 'users') navigate('/admin/users');
    else if (activeFilter === 'goals') navigate('/employee/goals');
    else if (activeFilter === 'audit') navigate('/admin/audit-logs');
    else if (activeFilter === 'reports') navigate('/admin/reports');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Search" size="lg">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across goals, employees, and more..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-100"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
            Search
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          {filters.map(f => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeFilter === f.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {f.label}
              </button>
            );
          })}
        </div>

        {query && (
          <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Press Enter to search for "{query}" in {filters.find(f => f.id === activeFilter)?.label}</p>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default SearchModal;

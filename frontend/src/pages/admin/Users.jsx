import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { getUsersApi, getManagersApi, createUserApi, updateUserApi, deleteUserApi } from '../../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Edit, Trash2, Search } from 'lucide-react';

const ROLES = ['employee', 'manager', 'admin'];
const DEPARTMENTS = ['Sales', 'Marketing', 'Operations', 'Engineering', 'HR', 'Finance', 'Product', 'Customer Service'];

const emptyForm = { name: '', email: '', password: 'password123', role: 'employee', department: '', managerId: '' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'edit' | null
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [usersRes, managersRes] = await Promise.all([getUsersApi(), getManagersApi()]);
      setUsers(usersRes.data.users || []);
      setManagers(managersRes.data.managers || []);
    } catch (e) { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setForm(emptyForm); setEditUser(null); setModal('create'); };
  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, department: user.department, managerId: user.managerId?._id || '' });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return; }
    setSaving(true);
    try {
      if (modal === 'create') {
        await createUserApi(form);
        toast.success('User created!');
      } else {
        await updateUserApi(editUser._id, form);
        toast.success('User updated!');
      }
      setModal(null);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserApi(id);
      toast.success('User deleted');
      setDeleteModal(null);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Cannot delete user'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors = { employee: 'bg-blue-100 text-blue-700', manager: 'bg-green-100 text-green-700', admin: 'bg-purple-100 text-purple-700' };

  return (
    <Layout title="User Management">
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, department..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-md shadow-blue-100">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {ROLES.map(role => {
            const count = users.filter(u => u.role === role).length;
            return (
              <div key={role} className="table-surface p-4 flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${roleColors[role]}`}>{role}</span>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Users Table */}
        <div className="table-surface p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-heading">
                    {['Name', 'Email', 'Role', 'Department', 'Manager', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user._id} className="table-row-hover border-b border-gray-50">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-gray-500">{user.email}</td>
                      <td className="py-3.5 pr-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-gray-600">{user.department || '—'}</td>
                      <td className="py-3.5 pr-4 text-sm text-gray-600">{user.managerId?.name || '—'}</td>
                      <td className="py-3.5 pr-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(user)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteModal(user._id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add New User' : 'Edit User'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {form.role === 'employee' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reporting Manager</label>
                <select value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select manager</option>
                  {managers.map(m => <option key={m._id} value={m._id}>{m.name} ({m.department})</option>)}
                </select>
              </div>
            )}
            {modal === 'create' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Default: password123"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving...' : modal === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete User" size="sm">
        <p className="text-sm text-gray-600 mb-5">Are you sure? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm">Cancel</button>
          <button onClick={() => handleDelete(deleteModal)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium">Delete</button>
        </div>
      </Modal>
    </Layout>
  );
};

export default Users;

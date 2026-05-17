import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Login from './pages/Login';

// Employee
import EmployeeDashboard from './pages/employee/Dashboard';
import CreateGoal from './pages/employee/CreateGoal';
import Goals from './pages/employee/Goals';
import CheckIns from './pages/employee/CheckIns';

// Manager
import ManagerDashboard from './pages/manager/Dashboard';
import Approvals from './pages/manager/Approvals';
import ManagerCheckIns from './pages/manager/CheckIns';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', fontFamily: 'Inter', fontSize: '14px', fontWeight: 500 },
            duration: 3000,
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={
            <ProtectedRoute roles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employee/create-goal" element={
            <ProtectedRoute roles={['employee']}>
              <CreateGoal />
            </ProtectedRoute>
          } />
          <Route path="/employee/goals" element={
            <ProtectedRoute roles={['employee']}>
              <Goals />
            </ProtectedRoute>
          } />
          <Route path="/employee/checkins" element={
            <ProtectedRoute roles={['employee']}>
              <CheckIns />
            </ProtectedRoute>
          } />

          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={
            <ProtectedRoute roles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/approvals" element={
            <ProtectedRoute roles={['manager']}>
              <Approvals />
            </ProtectedRoute>
          } />
          <Route path="/manager/checkins" element={
            <ProtectedRoute roles={['manager']}>
              <ManagerCheckIns />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute roles={['admin']}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/admin/audit-logs" element={
            <ProtectedRoute roles={['admin']}>
              <AuditLogs />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

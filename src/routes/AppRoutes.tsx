import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { StaffDashboard } from '../pages/staff/StaffDashboard';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { BorrowingPage } from '../pages/borrowing/BorrowingPage';
import { ReturningPage } from '../pages/returning/ReturningPage';
import { UserManagementPage } from '../pages/users/UserManagementPage';
import { HistoryPage } from '../pages/history/HistoryPage';

export const AppRoutes: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'}
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Protected Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Index redirect according to role */}
        <Route
          index
          element={
            <Navigate
              to={role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'}
              replace
            />
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Staff Dashboard */}
        <Route
          path="staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shared Functional Pages */}
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="borrowing" element={<BorrowingPage />} />
        <Route path="returning" element={<ReturningPage />} />
        <Route path="history" element={<HistoryPage />} />

        {/* Admin Only User Management */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};


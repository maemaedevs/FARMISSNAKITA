import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout, AuthLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import FarmersPage from '@/pages/farmers/FarmersPage';
import FarmerDetailsPage from '@/pages/farmers/FarmerDetailsPage';
import CropHarvestPage from '@/pages/crop-harvest/CropHarvestPage';
import DistributionsPage from '@/pages/assistance-programs/DistributionsPage';
import ProgramsListPage from '@/pages/assistance-programs/ProgramsListPage';
import TransactionsPage from '@/pages/transactions/TransactionsPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import DocumentVerificationPage from '@/pages/document-verification/DocumentVerificationPage';
import StockInventoryPage from '@/pages/inventory/StockInventoryPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import UsersPage from '@/pages/users/UsersPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

function PublicOnly({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/farmers" element={<FarmersPage />} />
          <Route path="/farmers/:id" element={<FarmerDetailsPage />} />
          <Route path="/crop-harvest" element={<CropHarvestPage />} />
          <Route
            path="/assistance-programs"
            element={
              <Navigate to="/assistance-programs/distributions" replace />
            }
          />
          <Route
            path="/assistance-programs/distributions"
            element={<DistributionsPage />}
          />
          <Route
            path="/assistance-programs/programs"
            element={<ProgramsListPage />}
          />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route
            path="/inventory"
            element={<Navigate to="/inventory/overview" replace />}
          />
          <Route
            path="/inventory/:segment"
            element={<StockInventoryPage />}
          />
          <Route
            path="/document-verification"
            element={<DocumentVerificationPage />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

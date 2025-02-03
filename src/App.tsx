import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { UserForm } from './components/UserForm';
import { QuestionPage } from './components/QuestionPage';
import { DatabaseInspector } from './components/DatabaseInspector';
import { Navbar } from './components/Navbar';
import { AdminLayout } from './components/admin/layout/AdminLayout';
import { DashboardPage } from './components/admin/pages/DashboardPage';
import { ApplicantsPage } from './components/admin/pages/ApplicantsPage';
import { ScoringPage } from './components/admin/pages/ScoringPage';
import { SettingsPage } from './components/admin/pages/SettingsPage';
import { AdminsPage } from './components/admin/pages/AdminsPage';
import { LoginPage } from './components/admin/pages/LoginPage';
import { supabase } from './lib/supabase';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAdmin(session?.user?.user_metadata?.role === 'admin');
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900">
        <div className="text-lg text-neutral-400">Verificando acceso...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

// New layout for public routes that includes the Navbar
function PublicLayout() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <Outlet />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="applicants" element={<ApplicantsPage />} />
          <Route path="scoring" element={<ScoringPage />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Public Routes */}
        <Route path="/*" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="questionnaire" element={<UserForm />} />
          <Route path="questions" element={<QuestionPage />} />
          <Route path="db-inspector" element={<DatabaseInspector />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

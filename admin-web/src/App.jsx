import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AuditsPage from './pages/AuditsPage.jsx';
import MasterPoisPage from './pages/MasterPoisPage.jsx';

function Protected({ children }) {
  const { isAuthenticated } = useAuth();
  const loc = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return children;
}

function Layout({ children }) {
  const { logout, user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold tracking-tight text-emerald-400">VNGo Admin</span>
            <nav className="flex gap-4 text-sm">
              <Link className="text-slate-300 hover:text-white" to="/">
                Pending POIs
              </Link>
              <Link className="text-slate-300 hover:text-white" to="/audits">
                Audit log
              </Link>
              <Link className="text-slate-300 hover:text-white" to="/pois">
                Manage POIs
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            {user?.email && <span>{user.email}</span>}
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-600 px-3 py-1 text-slate-200 hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout>
              <DashboardPage />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/audits"
        element={
          <Protected>
            <Layout>
              <AuditsPage />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/pois"
        element={
          <Protected>
            <Layout>
              <MasterPoisPage />
            </Layout>
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

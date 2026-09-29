import { useState } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'

import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'

import Dashboard from './pages/Dashboard.jsx'
import Employees from './pages/Employees.jsx'
import History from './pages/History.jsx'
import Templates from './pages/Templates.jsx'
import Settings from './pages/Settings.jsx'
import GenerateDocument, {
  useGenerateTitle,
} from './pages/GenerateDocument.jsx'

import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'

import { useAuth } from './context/AuthContext.jsx'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/history': 'Document History',
  '/templates': 'Templates',
  '/settings': 'Settings',
}

function usePageTitle() {
  const location = useLocation()
  const generateTitle = useGenerateTitle()

  if (location.pathname.startsWith('/generate')) {
    return generateTitle
  }

  return (
    PAGE_TITLES[location.pathname] ||
    'HR Document Generator'
  )
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-ink">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
        <p className="text-sm text-slate-500">
          Loading...
        </p>
      </div>
    </div>
  )
}

function ProtectedRoutes() {
  const { session, authLoading } = useAuth()
  const location = useLocation()

  if (authLoading) {
    return <AuthLoadingScreen />
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return (
    <AuthenticatedLayout />
  )
}

function AuthenticatedLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const title = usePageTitle()

  return (
    <div className="h-screen flex bg-surface text-ink overflow-hidden">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onMenuClick={() => setMobileMenuOpen(true)}
          title={title}
        />

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/history" element={<History />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/generate/*"
              element={<GenerateDocument />}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function PublicRoutes() {
  const { session, authLoading } = useAuth()

  if (authLoading) {
    return <AuthLoadingScreen />
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default function App() {
  const { session, authLoading } = useAuth()

  if (authLoading) {
    return <AuthLoadingScreen />
  }

  return session ? (
    <ProtectedRoutes />
  ) : (
    <PublicRoutes />
  )
}
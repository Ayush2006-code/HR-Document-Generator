import React, { useState } from 'react'
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { useAuth } from './context/AuthContext.jsx'

import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'

import Dashboard from './pages/Dashboard.jsx'
import Employees from './pages/Employees.jsx'
import History from './pages/History.jsx'
import Templates from './pages/Templates.jsx'
import Settings from './pages/Settings.jsx'

import OfferLetterGenerator from './components/OfferLetterGenerator.jsx'
import AppointmentLetterGenerator from './components/AppointmentLetterGenerator.jsx'
import SalarySlipGenerator from './components/SalarySlipGenerator.jsx'
import GenerateAllGenerator from './components/GenerateAllGenerator.jsx'

import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/history': 'Document History',
  '/templates': 'Templates',
  '/settings': 'Settings',
  '/generate/offer-letter': 'Offer Letter',
  '/generate/appointment-letter': 'Appointment Letter',
  '/generate/salary-slip': 'Salary Slip',
  '/generate/all': 'Generate All',
}

const ProtectedRoute = ({ children }) => {
  const { session, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        Loading workspace...
      </div>
    )
  }

  if (!session) {
    return <Navigate replace to="/login" />
  }

  return children
}

const PublicRoute = ({ children }) => {
  const { session, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        Loading workspace...
      </div>
    )
  }

  if (session) {
    return <Navigate replace to="/" />
  }

  return children
}

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const title =
    PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/generate/')
      ? 'Generate Document'
      : 'HR Workspace')

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex h-full min-h-0">
        {/* Sidebar stays fixed while the main workspace scrolls */}
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* Main application area */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Topbar stays fixed */}
          <div className="shrink-0">
            <Topbar
              title={title}
              onMenuClick={() => setMobileOpen(true)}
            />
          </div>

          {/* ONLY THIS AREA SCROLLS */}
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected application */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="employees"
          element={<Employees />}
        />

        <Route
          path="history"
          element={<History />}
        />

        <Route
          path="templates"
          element={<Templates />}
        />

        <Route
          path="settings"
          element={<Settings />}
        />

        <Route
          path="generate/offer-letter"
          element={<OfferLetterGenerator />}
        />

        <Route
          path="generate/appointment-letter"
          element={<AppointmentLetterGenerator />}
        />

        <Route
          path="generate/salary-slip"
          element={<SalarySlipGenerator />}
        />

        <Route
          path="generate/all"
          element={<GenerateAllGenerator />}
        />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default App
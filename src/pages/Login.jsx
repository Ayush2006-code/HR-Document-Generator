import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  ArrowRight,
  FileSignature,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    session,
    authLoading,
    login,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true })
    }
  }, [session, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }

    if (!password) {
      setError('Enter your password.')
      return
    }

    try {
      await login(
        email.trim().toLowerCase(),
        password
      )

      const from = location.state?.from || '/'

      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err?.message ||
          'Unable to sign in. Please check your email and password.'
      )
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10" />

      <div className="relative flex min-h-screen">

        {/* Left brand panel */}
        <div className="hidden w-[46%] flex-col justify-between bg-slate-950 p-10 text-white lg:flex xl:p-14">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                <FileSignature size={21} />
              </div>

              <div>
                <p className="text-base font-bold tracking-tight">
                  HR Docs
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  HR Workspace
                </p>
              </div>
            </div>

            <div className="mt-24 max-w-md">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-300">
                <Sparkles size={13} />
                Simple HR document management
              </div>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                Create professional HR documents without the busywork.
              </h1>

              <p className="mt-5 text-sm leading-7 text-slate-400 xl:text-base">
                Manage employees, generate documents, and keep your HR
                workflow organized from one clean workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={15} />
            Secure workspace
          </div>
        </div>

        {/* Login area */}
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-[430px]">

            {/* Mobile brand */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <FileSignature size={21} />
              </div>

              <div>
                <p className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  HR Docs
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                  HR Workspace
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                Welcome back
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Sign in to your workspace
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Continue managing your employees and HR documents.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3.5 text-sm leading-5 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    disabled={authLoading}
                    className="h-12 w-full rounded-xl bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-white dark:ring-slate-800"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    disabled={authLoading}
                    className="h-12 w-full rounded-xl bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-white dark:ring-slate-800"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={authLoading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span>
                  {authLoading
                    ? 'Signing in...'
                    : 'Sign in'}
                </span>

                {!authLoading && (
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </form>

            {/* Signup */}
            <div className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Create account
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck size={13} />
              Your workspace is protected by secure authentication.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
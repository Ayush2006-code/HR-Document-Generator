import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'
import {
  ArrowRight,
  Check,
  FileSignature,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext.jsx'

export default function Signup() {
  const navigate = useNavigate()

  const {
    session,
    authLoading,
    register,
  } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true })
    }
  }, [session, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess(false)

    if (!name.trim()) {
      setError('Enter your full name.')
      return
    }

    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }

    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      const result = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      })

      if (result) {
        navigate('/', { replace: true })
        return
      }

      setSuccess(true)
    } catch (err) {
      setError(
        err?.message ||
          'Unable to create your account. Please try again.'
      )
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10" />

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

            <div className="mt-20 max-w-md">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-300">
                <Sparkles size={13} />
                Your HR workspace starts here
              </div>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                Build a simpler HR workflow for your team.
              </h1>

              <p className="mt-5 text-sm leading-7 text-slate-400 xl:text-base">
                Keep employee information organized and create
                professional HR documents from one workspace.
              </p>

              <div className="mt-9 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-blue-400">
                    <Check size={15} />
                  </span>
                  Manage employee records
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-blue-400">
                    <Check size={15} />
                  </span>
                  Generate HR documents quickly
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-blue-400">
                    <Check size={15} />
                  </span>
                  Keep your workflow organized
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={15} />
            Secure workspace
          </div>
        </div>

        {/* Signup area */}
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-[430px]">

            {/* Mobile brand */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
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
            <div className="mb-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                Get started
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Create your workspace
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Create an account to start managing your HR documents.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3.5 text-sm leading-5 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 flex gap-3 rounded-2xl bg-emerald-50 px-4 py-3.5 text-sm leading-5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={12} />
                </div>

                <span>
                  Account created successfully. Please check
                  your email and verify your account before
                  signing in.
                </span>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Your full name"
                    disabled={authLoading}
                    className="h-12 w-full rounded-xl bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-white dark:ring-slate-800"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Minimum 8 characters"
                    disabled={authLoading}
                    className="h-12 w-full rounded-xl bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-white dark:ring-slate-800"
                  />
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Re-enter your password"
                    disabled={authLoading}
                    className="h-12 w-full rounded-xl bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-white dark:ring-slate-800"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={authLoading}
                className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span>
                  {authLoading
                    ? 'Creating account...'
                    : 'Create account'}
                </span>

                {!authLoading && (
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </form>

            {/* Login */}
            <div className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-7 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck size={13} />
              Your workspace is protected by secure authentication.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
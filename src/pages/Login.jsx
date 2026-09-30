import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, Mail, Building2, CheckSquare, Square, ArrowRight, 
  ShieldCheck, Sun, Moon, FileCheck2, Users, Zap, CheckCircle2 
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(false); // Light default
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: loginError } = await login(email, password, rememberMe);
      if (loginError) throw loginError;
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} transition-colors duration-300 font-sans`}>
      
      {/* LEFT SIDE: Form & Auth */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 relative z-10 border-r ${isDark ? 'border-slate-800/80 bg-slate-950' : 'border-slate-200/80 bg-slate-50'}`}>
        
        {/* Top Header: Logo + Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Building2 className="w-6 h-6" />
            </div>
            <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              HR Generator
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all shadow-sm ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Center Auth Form */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="mb-8">
            <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome back
            </h1>
            <p className={`mt-2 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Please enter your details to sign in to your workspace.
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-3.5 rounded-xl text-xs font-medium border ${
              isDark 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-red-50 border-red-300 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border rounded-xl py-3 pl-11 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
                  }`}
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border rounded-xl py-3 pl-11 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
                  }`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label 
                className={`flex items-center text-sm cursor-pointer select-none space-x-2.5 ${
                  isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                }`}
                onClick={() => setRememberMe(!rememberMe)}
              >
                {rememberMe ? (
                  <CheckSquare className="w-4.5 h-4.5 text-blue-600" />
                ) : (
                  <Square className={`w-4.5 h-4.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                )}
                <span className="font-semibold text-xs">Remember me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <p className={`text-center text-xs pt-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold underline transition-colors">
                Create Account
              </Link>
            </p>
          </form>
        </div>

        {/* Footer info */}
        <div className={`flex items-center justify-between text-xs font-medium border-t pt-4 ${isDark ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>256-bit Encrypted Workspace</span>
          </div>
          <span>© HR Generator</span>
        </div>
      </div>

      {/* RIGHT SIDE: Visual Showcase Banner with Smooth Gradient Overlay */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white relative overflow-hidden flex-col justify-between p-12">
        
        {/* Soft Ambient Gradients */}
        <div className="absolute -top-32 -right-32 w-[35rem] h-[35rem] bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-[35rem] h-[35rem] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Feature Tag */}
        <div className="relative z-10 flex items-center space-x-2 bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-slate-700/80 text-xs font-semibold text-blue-400 shadow-sm">
          <Zap className="w-4 h-4" />
          <span>Automated HR Operations & Document Suite</span>
        </div>

        {/* Center Content / Hero Feature Cards */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
              Generate Offer Letters, Appointment Letters & Salary Slips in Seconds.
            </h2>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed font-normal">
              Enterprise-grade document generator designed for modern HR teams. Complete database sync, automated salary calculations, and customizable docx templates.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2">
            <div className="flex items-start space-x-3.5 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">Formatted DOCX Output</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">Pixel-perfect headers, footers, logos, and multi-page annexures.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">Isolated Employee Vault</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">Strict Row-Level Security keeps your employee data 100% private.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof Badge */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Production Ready System</span>
          </div>
          <span>v2.4 Enterprise</span>
        </div>
      </div>

    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login } = useStore();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'register' && !form.name.trim()) e.name = 'Name required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/${mode === 'login' ? 'login' : 'register'}`, form);
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setErrors({ form: err.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-brand flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-[-150px] left-[-80px] w-80 h-80 rounded-full bg-white/5 blur-3xl" />

      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mx-auto mb-4 text-4xl font-black text-white shadow-2xl"
            whileHover={{ scale: 1.05, rotate: 5 }}>C</motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">CircleUp</h1>
          <p className="text-white/70 mt-2 text-base">Connecting people, creating memories</p>
        </div>

        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-7">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === m ? 'gradient-brand text-white shadow' : 'text-gray-500'}`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {errors.form && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">{errors.form}</div>
          )}

          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm bg-gray-50 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:bg-white ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm bg-gray-50 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:bg-white ${errors.email ? 'border-red-400' : 'border-gray-200'}`} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border text-sm bg-gray-50 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:bg-white ${errors.password ? 'border-red-400' : 'border-gray-200'}`} />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button onClick={submit} disabled={loading}
              className="w-full gradient-brand text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.01] transition-all disabled:opacity-60">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Please wait...</> : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-brand-600 font-bold hover:underline">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

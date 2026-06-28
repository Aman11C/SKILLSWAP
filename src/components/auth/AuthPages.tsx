import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase, isSupabaseConfigured } from '../../supabase/client';
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../../lib/schemas';
import { ensureUserProfile } from '../../services/profileService';
import toast, { Toaster } from 'react-hot-toast';
import { KeyRound, Mail, User, School, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import BrutalistCard from '../BrutalistCard';
import BrutalistButton from '../BrutalistButton';

interface AuthPagesProps {
  onAuthSuccess: (session: any) => void;
  onBypassMock: () => void;
}

type AuthTab = 'login' | 'signup' | 'forgot' | 'reset';

export default function AuthPages({ onAuthSuccess, onBypassMock }: AuthPagesProps) {
  const [tab, setTab] = useState<AuthTab>('login');
  const [loading, setLoading] = useState(false);

  // Check if password reset flow is triggered via URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '';
      if (hash.includes('access_token=') && hash.includes('type=recovery')) {
        setTab('reset');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 1. Login form hook
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  // 2. Signup form hook
  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', name: '', college: '' }
  });

  // 3. Forgot password hook
  const {
    register: forgotRegister,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  // 4. Reset password hook
  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onLogin = async (data: any) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        toast.success('Bypassing in Mock Mode.');
        onBypassMock();
        return;
      }
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      toast.success('Successfully logged in.');
      onAuthSuccess(authData.session);
    } catch (err: any) {
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (data: any) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        toast.success('Bypassing in Mock Mode.');
        onBypassMock();
        return;
      }
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            college: data.college,
          },
        },
      });
      if (error) throw error;
      
      if (authData.user) {
        await ensureUserProfile(authData.user.id, {
          name: data.name,
          college: data.college,
          avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(data.name)}`,
        });
      }

      toast.success('Signup successful. Please verify email if configured.');
      if (authData.session) {
        onAuthSuccess(authData.session);
      } else {
        setTab('login');
      }
    } catch (err: any) {
      toast.error(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async (data: any) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        toast.error('Supabase is not configured for forgot password.');
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/#type=recovery`,
      });
      if (error) throw error;
      toast.success('Password reset link sent to email.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send recovery email.');
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data: any) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        toast.error('Supabase is not configured.');
        return;
      }
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;
      toast.success('Password updated successfully.');
      setTab('login');
      window.location.hash = '';
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans flex flex-col justify-center items-center p-6 relative overflow-hidden select-none">
      <Toaster position="top-right" />
      
      {/* Neo-brutalist floating backgrounds */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#bef264] border-4 border-black rounded-none shadow-[4px_4px_0px_#000] rotate-6 hidden md:block" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-400 border-4 border-black rounded-none shadow-[8px_8px_0px_#000] -rotate-12 hidden md:block" />

      {/* Main card */}
      <div className="max-w-md w-full z-10">
        <div className="text-center mb-6">
          <div className="inline-block">
            <span className="text-4xl font-black tracking-tighter uppercase font-mono">
              SKILL
            </span>
            <span className="text-4xl font-black tracking-tighter uppercase font-mono bg-[#bef264] border-4 border-black px-4 py-2 rotate-[-2deg] shadow-[4px_4px_0px_#000] inline-block ml-1">
              SWAP
            </span>
          </div>
          <p className="text-xs font-mono font-bold text-slate-500 mt-4 uppercase">
            Learn and Teach Skills with Your College Peers
          </p>
        </div>

        <BrutalistCard className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000]">
          
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4 font-mono text-left">
              <h2 className="text-xl font-black uppercase tracking-tight mb-2 border-b-2 border-black pb-2 flex items-center justify-between">
                <span>LOGIN</span>
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              </h2>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@college.edu"
                  {...loginRegister('email')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {loginErrors.email && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {loginErrors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...loginRegister('password')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {loginErrors.password && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {loginErrors.password.message}
                  </p>
                )}
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-[10px] font-bold underline hover:text-[#bef264] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="pt-2 space-y-2">
                <BrutalistButton
                  variant="yellow"
                  className="w-full justify-center flex py-3"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Sign In'} <ArrowRight className="w-4 h-4 ml-1" />
                </BrutalistButton>

                {!isSupabaseConfigured && (
                  <BrutalistButton
                    variant="white"
                    className="w-full justify-center flex py-2 border-dashed"
                    onClick={onBypassMock}
                    type="button"
                  >
                    Bypass in Mock Mode (No DB)
                  </BrutalistButton>
                )}
              </div>

              <p className="text-xs text-center text-slate-500 pt-2 font-sans font-medium">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="font-bold underline text-black hover:text-[#bef264]"
                >
                  Sign Up
                </button>
              </p>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4 font-mono text-left">
              <h2 className="text-xl font-black uppercase tracking-tight mb-2 border-b-2 border-black pb-2">
                CREATE ACCOUNT
              </h2>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <input
                  type="text"
                  placeholder="Aman Chouhan"
                  {...signupRegister('name')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {signupErrors.name && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {signupErrors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <School className="w-3.5 h-3.5" /> College / Institution
                </label>
                <input
                  type="text"
                  placeholder="Delhi Technological University"
                  {...signupRegister('college')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {signupErrors.college && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {signupErrors.college.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@college.edu"
                  {...signupRegister('email')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {signupErrors.email && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {signupErrors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> Password (min 6 chars)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...signupRegister('password')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {signupErrors.password && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {signupErrors.password.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <BrutalistButton
                  variant="yellow"
                  className="w-full justify-center flex py-3"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Register'}
                </BrutalistButton>
              </div>

              <p className="text-xs text-center text-slate-500 pt-2 font-sans font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="font-bold underline text-black hover:text-[#bef264]"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {tab === 'forgot' && (
            <form onSubmit={handleForgotSubmit(onForgotPassword)} className="space-y-4 font-mono text-left">
              <h2 className="text-xl font-black uppercase tracking-tight mb-2 border-b-2 border-black pb-2">
                RESET PASSWORD
              </h2>
              <p className="text-[10px] text-slate-500 font-sans font-medium mb-3">
                Enter your email address and we'll send you a recovery link to update your password.
              </p>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@college.edu"
                  {...forgotRegister('email')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {forgotErrors.email && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {forgotErrors.email.message}
                  </p>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <BrutalistButton
                  variant="yellow"
                  className="w-full justify-center flex py-3"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Recovery Email'}
                </BrutalistButton>

                <BrutalistButton
                  variant="white"
                  className="w-full justify-center flex py-2"
                  type="button"
                  onClick={() => setTab('login')}
                >
                  Back to Login
                </BrutalistButton>
              </div>
            </form>
          )}

          {tab === 'reset' && (
            <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-4 font-mono text-left">
              <h2 className="text-xl font-black uppercase tracking-tight mb-2 border-b-2 border-black pb-2">
                CHOOSE NEW PASSWORD
              </h2>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...resetRegister('password')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {resetErrors.password && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {resetErrors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...resetRegister('confirmPassword')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {resetErrors.confirmPassword && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {resetErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <BrutalistButton
                  variant="yellow"
                  className="w-full justify-center flex py-3"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Set Password'}
                </BrutalistButton>
              </div>
            </form>
          )}

        </BrutalistCard>
      </div>
    </div>
  );
}

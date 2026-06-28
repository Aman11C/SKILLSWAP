import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '../lib/schemas';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import BrutalistCard from './BrutalistCard';
import BrutalistButton from './BrutalistButton';
import toast from 'react-hot-toast';
import { Shield, KeyRound, LogOut, Moon, Bell, AlertCircle, Info } from 'lucide-react';

interface SettingsProps {
  onSignOut: () => void;
}

export default function Settings({ onSignOut }: SettingsProps) {
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onChangePassword = async (data: any) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        toast.success('Mock password changed.');
        reset();
        return;
      }
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;
      toast.success('Password updated successfully.');
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutClick = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      toast.success('Signed out successfully.');
      onSignOut();
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign out.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6 text-left">
      {/* Settings Banner */}
      <div className="bg-blue-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase font-mono tracking-tight leading-none">
            Swap Hub Settings
          </h2>
          <p className="text-sm font-mono mt-2 text-indigo-100 font-bold">
            Configure preferences, account security, and notifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left column: Change password (Span 7) */}
        <div className="md:col-span-7 space-y-6">
          <BrutalistCard className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000]">
            <h3 className="text-lg font-black font-mono uppercase tracking-tight mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              Update Account Password
            </h3>

            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 font-mono">
              <div>
                <label className="block text-xs font-black uppercase mb-1">New Password:</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {errors.password && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Confirm New Password:</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <BrutalistButton variant="yellow" className="w-full justify-center flex py-3" type="submit" disabled={loading}>
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </BrutalistButton>
              </div>
            </form>
          </BrutalistCard>
        </div>

        {/* Right column: Preferences & Actions (Span 5) */}
        <div className="md:col-span-5 space-y-6">
          <BrutalistCard className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000] font-mono space-y-4">
            <h3 className="text-lg font-black uppercase tracking-tight mb-2 border-b-2 border-black pb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Preferences
            </h3>

            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold">Dark theme</span>
              </div>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => {
                  setDarkMode(e.target.checked);
                  toast.success(e.target.checked ? 'Dark theme enabled (simulated)' : 'Light theme enabled');
                }}
                className="w-4 h-4 accent-black"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold">Email alerts</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => {
                  setEmailNotifications(e.target.checked);
                  toast.success(e.target.checked ? 'Email notifications enabled' : 'Email notifications disabled');
                }}
                className="w-4 h-4 accent-black"
              />
            </div>

            <div className="pt-2">
              <BrutalistButton variant="black" className="w-full justify-center flex py-3 gap-2" onClick={handleSignOutClick}>
                <LogOut className="w-4 h-4" /> Sign Out from Account
              </BrutalistButton>
            </div>
          </BrutalistCard>

          <BrutalistCard className="bg-slate-50 border-2 border-black p-4 space-y-2 font-mono">
            <div className="flex gap-2 items-center text-xs font-black text-slate-700">
              <Info className="w-4 h-4" />
              <span>SKILLSWAP SYSTEM INFO</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Running SkillSwap client connection layers. Supabase auth controls session validation checks recursively.
            </p>
          </BrutalistCard>
        </div>
      </div>
    </div>
  );
}

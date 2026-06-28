import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Profile } from '../types';
import { POPULAR_SKILLS } from '../data';
import { profileSchema } from '../lib/schemas';
import { User, Contact, MapPin, School, HelpCircle, Check, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';
import BrutalistCard from './BrutalistCard';
import BrutalistButton from './BrutalistButton';

interface ProfileEditorProps {
  profile: Profile;
  onSave: (updated: Profile) => void;
}

export default function ProfileEditor({ profile, onSave }: ProfileEditorProps) {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || '',
      college: profile.college || '',
      bio: profile.bio || '',
      location: profile.location || '',
      contactUrl: profile.contactUrl || '',
      avatar: profile.avatar || '',
      teachSkills: profile.teachSkills || [],
      learnSkills: profile.learnSkills || [],
    }
  });

  const teachSkills = watch('teachSkills') || [];
  const learnSkills = watch('learnSkills') || [];
  const avatar = watch('avatar') || '';
  const name = watch('name') || '';
  const college = watch('college') || '';

  const toggleTeachSkill = (skill: string) => {
    const updated = teachSkills.includes(skill)
      ? teachSkills.filter(s => s !== skill)
      : [...teachSkills, skill];
    setValue('teachSkills', updated, { shouldValidate: true });
  };

  const toggleLearnSkill = (skill: string) => {
    const updated = learnSkills.includes(skill)
      ? learnSkills.filter(s => s !== skill)
      : [...learnSkills, skill];
    setValue('learnSkills', updated, { shouldValidate: true });
  };

  const onSubmit = (data: any) => {
    onSave({
      ...profile,
      name: data.name,
      college: data.college,
      bio: data.bio,
      location: data.location,
      contactUrl: data.contactUrl,
      avatar: data.avatar,
      teachSkills: data.teachSkills,
      learnSkills: data.learnSkills
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6 font-mono text-left select-none">
      {/* Banner */}
      <div className="bg-[#bef264] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] text-black flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase leading-none">Your Swap Profile</h2>
          <p className="text-xs font-mono mt-1 text-slate-800">Customize what skills you offer to teach and what you want to learn.</p>
        </div>
      </div>

      {success && (
        <div className="bg-[#bef264] border-4 border-black p-4 font-mono text-black font-bold flex items-center gap-2 shadow-[4px_4px_0px_#000] animate-bounce">
          <Check className="w-5 h-5 border-2 border-black bg-white rounded-full p-0.5" />
          <span>Profile configuration saved! Match percentages have re-synchronized!</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image & Bio (Span 4) */}
        <div className="md:col-span-4 space-y-4">
          <BrutalistCard className="text-center p-6 border-4 border-black bg-white flex flex-col items-center">
            <img 
              src={avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&auto=format&fit=crop&q=80'} 
              alt={name || 'User'} 
              className="w-24 h-24 border-4 border-black bg-[#bef264] rounded-none mb-3"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-sm font-black uppercase text-black truncate max-w-full">{name || 'Your Name'}</h3>
            <p className="text-[10px] text-indigo-600 font-bold uppercase truncate max-w-full mt-0.5">{college || 'Student'}</p>
            
            {/* Change Avatar button inputs */}
            <div className="mt-4 w-full text-left">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Avatar Image URL:</label>
              <input
                type="text"
                {...register('avatar')}
                className="w-full bg-white border-2 border-black p-2 text-[10px] font-bold focus:outline-none"
              />
              {errors.avatar && (
                <p className="text-[9px] text-red-600 font-bold mt-1 flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3" /> {errors.avatar.message}
                </p>
              )}
            </div>
          </BrutalistCard>

          <BrutalistCard className="bg-slate-50 p-4 border-2 border-black space-y-3">
            <div className="flex gap-2 items-center text-xs font-black">
              <HelpCircle className="w-4 h-4 text-slate-600" />
              <span>HOW SWAPPING WORKS?</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              When you select skills under <strong className="text-black">"Skills I Can Teach"</strong> and <strong className="text-black">"Skills I Want To Learn"</strong>, other users whose requirements match yours are instantly prioritized in your Explore stream with high compatibility index scores. Keep them updated to receive the best swap offers!
            </p>
          </BrutalistCard>
        </div>

        {/* Right Column: Bio form values (Span 8) */}
        <div className="md:col-span-8 space-y-6">
          <BrutalistCard className="border-4 border-black bg-white p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" /> Full Name:
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {errors.name && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-slate-500" /> College / Institution:
                </label>
                <input
                  type="text"
                  {...register('college')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {errors.college && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.college.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Location / Region:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi, IN"
                  {...register('location')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <Contact className="w-3.5 h-3.5 text-slate-500" /> Email / Contact:
                </label>
                <input
                  type="text"
                  placeholder="e.g. mailto:example@college.edu"
                  {...register('contactUrl')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">A Short Pitch (Bio):</label>
              <textarea
                rows={3}
                {...register('bio')}
                className="w-full bg-white border-2 border-black p-3 text-xs font-bold focus:outline-none"
              />
              {errors.bio && (
                <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.bio.message}
                </p>
              )}
            </div>

            {/* Select Teach Skills */}
            <div className="pt-3 border-t border-dashed border-slate-300">
              <label className="text-xs font-black uppercase mb-2 block flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-emerald-600" /> Skills I Can Teach:
              </label>
              {errors.teachSkills && (
                <p className="text-[10px] text-red-600 font-bold mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.teachSkills.message}
                </p>
              )}
              <div className="flex flex-wrap gap-2 bg-slate-50 p-3 border-2 border-black max-h-[140px] overflow-y-auto">
                {POPULAR_SKILLS.map(skill => {
                  const isSelected = teachSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleTeachSkill(skill)}
                      className={`text-[10px] font-black uppercase tracking-tight px-2 py-1 border transition-all ${
                        isSelected 
                          ? 'bg-[#bef264] text-black border-black shadow-[2px_2px_0px_#000]' 
                          : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select Learn Skills */}
            <div className="pt-3 border-t border-dashed border-slate-300">
              <label className="text-xs font-black uppercase mb-2 block flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Skills I Want to Learn:
              </label>
              {errors.learnSkills && (
                <p className="text-[10px] text-red-600 font-bold mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.learnSkills.message}
                </p>
              )}
              <div className="flex flex-wrap gap-2 bg-slate-50 p-3 border-2 border-black max-h-[140px] overflow-y-auto">
                {POPULAR_SKILLS.map(skill => {
                  const isSelected = learnSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleLearnSkill(skill)}
                      className={`text-[10px] font-black uppercase tracking-tight px-2 py-1 border transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-black shadow-[2px_2px_0px_#000]' 
                          : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3">
              <BrutalistButton
                variant="yellow"
                className="w-full py-3"
                type="submit"
              >
                Save My Changes & Re-Sync Matches
              </BrutalistButton>
            </div>
          </BrutalistCard>
        </div>
      </form>
    </div>
  );
}

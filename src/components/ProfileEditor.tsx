import React, { useState } from 'react';
import { Profile } from '../types';
import { POPULAR_SKILLS } from '../data';
import { User, Contact, MapPin, School, HelpCircle, Check, BookOpen, GraduationCap } from 'lucide-react';
import BrutalistCard from './BrutalistCard';
import BrutalistButton from './BrutalistButton';

interface ProfileEditorProps {
  profile: Profile;
  onSave: (updated: Profile) => void | Promise<void>;
}

export default function ProfileEditor({ profile, onSave }: ProfileEditorProps) {
  const [name, setName] = useState(profile.name);
  const [college, setCollege] = useState(profile.college);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location || '');
  const [contactUrl, setContactUrl] = useState(profile.contactUrl || '');
  const [avatar, setAvatar] = useState(profile.avatar);
  const [teachSkills, setTeachSkills] = useState<string[]>(profile.teachSkills);
  const [learnSkills, setLearnSkills] = useState<string[]>(profile.learnSkills);
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleTeachSkill = (skill: string) => {
    if (teachSkills.includes(skill)) {
      setTeachSkills(teachSkills.filter(s => s !== skill));
    } else {
      setTeachSkills([...teachSkills, skill]);
    }
  };

  const toggleLearnSkill = (skill: string) => {
    if (learnSkills.includes(skill)) {
      setLearnSkills(learnSkills.filter(s => s !== skill));
    } else {
      setLearnSkills([...learnSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave({
        ...profile,
        name,
        college,
        bio,
        location,
        contactUrl,
        avatar,
        teachSkills,
        learnSkills
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch {
      setSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6 font-mono text-left">
      
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Image & Bio (Span 4) */}
        <div className="md:col-span-4 space-y-4">
          <BrutalistCard className="text-center p-6 border-4 border-black bg-white flex flex-col items-center">
            <img 
              src={avatar} 
              alt={name} 
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
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-white border-2 border-black p-2 text-[10px] font-bold focus:outline-none"
              />
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
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-slate-500" /> College / Institution:
                </label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Location / Region:
                </label>
                <input
                  type="text"
                  value={location}
                  placeholder="e.g. Delhi, IN"
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <Contact className="w-3.5 h-3.5 text-slate-500" /> Email / Contact:
                </label>
                <input
                  type="text"
                  value={contactUrl}
                  placeholder="e.g. mailto:example@college.edu"
                  onChange={(e) => setContactUrl(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">A Short Pitch (Bio):</label>
              <textarea
                required
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white border-2 border-black p-3 text-xs font-bold focus:outline-none"
              />
            </div>

            {/* Select Teach Skills */}
            <div className="pt-3 border-t border-dashed border-slate-300">
              <label className="text-xs font-black uppercase mb-2 block flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-emerald-600" /> Skills I Can Teach:
              </label>
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
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save My Changes & Re-Sync Matches'}
              </BrutalistButton>
            </div>

          </BrutalistCard>
        </div>

      </form>

    </div>
  );
}

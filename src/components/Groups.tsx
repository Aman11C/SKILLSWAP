import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Profile, StudyTeam } from '../types';
import { teamSchema } from '../lib/schemas';
import { Users, Plus, Check, FolderPlus, Tag, ArrowUpRight, AlertCircle } from 'lucide-react';
import BrutalistCard from './BrutalistCard';
import BrutalistButton from './BrutalistButton';

interface GroupsProps {
  teams: StudyTeam[];
  onJoinTeam: (teamId: string) => void;
  onCreateTeam: (team: Omit<StudyTeam, 'id' | 'membersCount' | 'joined'>) => void;
  userProfile: Profile | null;
}

export default function Groups({ teams, onJoinTeam, onCreateTeam, userProfile }: GroupsProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'Hackathon',
      skillsRequired: '',
      maxMembers: 4,
    }
  });

  const onSubmit = (data: any) => {
    // Split skills by comma
    const skillsArray = data.skillsRequired
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const colors = [
      'from-[#eaff00] to-yellow-400',
      'from-blue-600 to-[#2563eb]',
      'from-pink-600 to-rose-400',
      'from-purple-600 to-indigo-500'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onCreateTeam({
      name: data.name,
      description: data.description,
      category: data.category,
      skillsRequired: skillsArray.length > 0 ? skillsArray : ['General'],
      maxMembers: Number(data.maxMembers),
      imageColor: randomColor,
      createdBy: userProfile?.name || 'Aman Chouhan'
    });

    setIsCreateOpen(false);
    reset();
    
    setSuccessMsg(`Created team: "${data.name}" successfully!`);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 select-none">
      {/* Header Panel */}
      <div className="bg-[#bef264] border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] text-black flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase leading-none">Build Together Teams</h2>
          <p className="text-sm font-mono mt-2 text-slate-800 font-bold">Join or launch a hackathon squad, coding guild, or peer study circle.</p>
        </div>
        <BrutalistButton
          variant="black"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="w-4 h-4" /> Launch New Squad
        </BrutalistButton>
      </div>

      {successMsg && (
        <div className="bg-emerald-100 border-4 border-black p-4 font-mono text-emerald-950 font-bold flex items-center gap-2 shadow-[4px_4px_0px_#000]">
          <Check className="w-5 h-5 border-2 border-black bg-white rounded-full p-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid of study teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.id} className="flex flex-col h-full">
            <BrutalistCard
              className="flex-1 flex flex-col justify-between border-4 border-black bg-white hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
            >
            <div>
              {/* Graphic Badge */}
              <div className={`h-24 border-2 border-black bg-gradient-to-tr ${team.imageColor} mb-4 relative flex items-center p-4`}>
                <span className="absolute top-2 right-2 border-2 border-black bg-white px-2 py-0.5 text-[9px] font-black font-mono uppercase tracking-wider">
                  {team.category}
                </span>
                <h3 className="text-lg font-black text-black leading-tight uppercase font-mono tracking-tight drop-shadow-[1px_1px_0px_rgba(255,255,255,1)]">
                  {team.name}
                </h3>
              </div>

              {/* Creators credit */}
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">CREATED BY: {team.createdBy}</p>

              {/* Description */}
              <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium mt-2">
                {team.description}
              </p>

              {/* Skills Tags Needed */}
              <div className="mt-4 pt-3 border-t border-dashed border-slate-300">
                <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Seeking Experts In:</span>
                <div className="flex flex-wrap gap-1.5">
                  {team.skillsRequired.map(skill => (
                    <span
                      key={skill}
                      className="text-[10px] font-black font-mono border border-black bg-slate-50 px-1.5 py-0.5 text-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Join Control Section */}
            <div className="mt-6 pt-3 border-t-2 border-black flex justify-between items-center gap-4">
              <div className="flex items-center gap-2 font-mono">
                <Users className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-700">
                  {team.membersCount} / {team.maxMembers} Members
                </span>
              </div>

              <BrutalistButton
                variant={team.joined ? 'white' : 'blue'}
                size="sm"
                onClick={() => onJoinTeam(team.id)}
              >
                {team.joined ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Leave Squad
                  </span>
                ) : (
                  <span className="flex items-center gap-1">Join Squad <ArrowUpRight className="w-3.5 h-3.5" /></span>
                )}
              </BrutalistButton>
            </div>

            </BrutalistCard>
          </div>
        ))}
      </div>

      {/* Launch Team Dialog Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black max-w-md w-full p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
            
            {/* Close */}
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-4 top-4 border-2 border-black bg-red-400 p-1 hover:bg-red-500 active:translate-y-0.5 shadow-[2px_2px_0px_#000]"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 border-b-2 border-black pb-3 mb-5">
              <FolderPlus className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-black uppercase tracking-tight font-mono">Launch a Study Squad</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-mono text-left">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Squad Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Hackathon Front-end Devs"
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
                <label className="block text-xs font-black uppercase mb-1">Squad Category:</label>
                <select
                  {...register('category')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                >
                  <option value="Hackathon">Hackathon</option>
                  <option value="Study Group">Study Group</option>
                  <option value="Design Sprint">Design Sprint</option>
                  <option value="Open Source">Open Source</option>
                </select>
                {errors.category && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Brief Pitch / Mission:</label>
                <textarea
                  rows={3}
                  placeholder="Tell peers what you are building, what help you need, and when you meet..."
                  {...register('description')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {errors.description && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Skills Needed (comma separated):
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Solidity, Figma"
                  {...register('skillsRequired')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {errors.skillsRequired && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.skillsRequired.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Max Team Size:</label>
                <input
                  type="number"
                  {...register('maxMembers', { valueAsNumber: true })}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {errors.maxMembers && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.maxMembers.message}
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <BrutalistButton
                  variant="black"
                  className="flex-1"
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Close
                </BrutalistButton>

                <BrutalistButton
                  variant="yellow"
                  className="flex-1"
                  type="submit"
                >
                  Launch Squad 🚀
                </BrutalistButton>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

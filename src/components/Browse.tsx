import { useState } from 'react';
import { Profile, MatchRequest } from '../types';
import { Search, Filter, Sparkles, AlertCircle, ArrowRight, Check, Send, ShieldAlert } from 'lucide-react';
import BrutalistCard from './BrutalistCard';
import BrutalistButton from './BrutalistButton';

interface BrowseProps {
  profiles: Profile[];
  userProfile: Profile;
  onRequestMatch: (receiverId: string, proposedSkill: string, message: string) => void;
  activeRequests: MatchRequest[];
}

export default function Browse({ profiles, userProfile, onRequestMatch, activeRequests }: BrowseProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLearnFilter, setSelectedLearnFilter] = useState('');
  const [selectedTeachFilter, setSelectedTeachFilter] = useState('');
  
  // Modal states
  const [requestModalUser, setRequestModalUser] = useState<Profile | null>(null);
  const [proposedSkill, setProposedSkill] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Exclude current user from the list
  const otherProfiles = profiles.filter(p => p.id !== userProfile?.id);

  // Dynamic search and tag filtering
  const filteredProfiles = otherProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLearn = selectedLearnFilter === '' || profile.learnSkills.includes(selectedLearnFilter);
    const matchesTeach = selectedTeachFilter === '' || profile.teachSkills.includes(selectedTeachFilter);
    return matchesSearch && matchesLearn && matchesTeach;
  });

  // Unique list of skills for filter dropdowns
  const allTeachSkills = Array.from(new Set(otherProfiles.flatMap(p => p.teachSkills)));
  const allLearnSkills = Array.from(new Set(otherProfiles.flatMap(p => p.learnSkills)));

  // Open Request Match Dialog
  const openRequestModal = (profile: Profile) => {
    setRequestModalUser(profile);
    // Suggest first skill we teach that they want to learn, or first they teach we want to learn
    const defaultProposed = userProfile.teachSkills.find(s => profile.learnSkills.includes(s)) || userProfile.teachSkills[0] || '';
    setProposedSkill(defaultProposed);
    setProposalMessage(`Hey ${profile.name}! I noticed you want to learn ${defaultProposed || 'coding'}, and you teach ${profile.teachSkills[0] || 'design'}. Let's do a session soon!`);
  };

  // Submit Request Match
  const handleSendRequest = () => {
    if (!requestModalUser) return;
    onRequestMatch(requestModalUser.id, proposedSkill, proposalMessage);
    
    setSuccessNotice(`Sent proposal to ${requestModalUser.name}!`);
    setRequestModalUser(null);
    setProposalMessage('');
    
    setTimeout(() => {
      setSuccessNotice(null);
    }, 4000);
  };

  // Calculate Match Percentage and crossover details
  const getMatchAnalysis = (profile: Profile) => {
    const weTeachTheyWant = userProfile.teachSkills.filter(s => profile.learnSkills.includes(s));
    const theyTeachWeWant = profile.teachSkills.filter(s => userProfile.learnSkills.includes(s));
    
    const isMutual = weTeachTheyWant.length > 0 && theyTeachWeWant.length > 0;
    
    let score = 0;
    if (isMutual) {
      score = 95; // Crossover
    } else if (weTeachTheyWant.length > 0 || theyTeachWeWant.length > 0) {
      score = 70; // Partial swap matches
    } else {
      score = 40; // General compatibility
    }

    return {
      score,
      isMutual,
      weTeachTheyWant,
      theyTeachWeWant
    };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Search Header Banner */}
      <div className="bg-[#2563eb] border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase leading-none">Find Your Swap Partner</h2>
          <p className="text-sm font-mono mt-2 text-indigo-100 font-medium">Browse peers in colleges teaching exactly what you want to learn.</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-[#bef264] border-2 border-black text-black text-xs font-bold px-3 py-1.5 uppercase font-mono shadow-[2px_2px_0px_#000]">
            {filteredProfiles.length} PEERS ONLINE
          </span>
        </div>
      </div>

      {successNotice && (
        <div className="bg-[#bef264] border-4 border-black p-4 font-mono text-black font-bold flex items-center justify-between shadow-[4px_4px_0px_#000] animate-bounce">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 border-2 border-black bg-white rounded-full p-0.5" />
            <span>{successNotice} <strong className="underline">A reply is simulated within 3 seconds!</strong></span>
          </div>
        </div>
      )}

      {/* Filter / Search Bar Row */}
      <BrutalistCard variant="white" className="border-4 border-black p-4 bg-slate-50 flex flex-col lg:flex-row gap-4">
        
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, college, skills, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-black p-3 pl-11 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:bg-indigo-50/20"
          />
        </div>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap md:flex-nowrap gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-600 flex-shrink-0" />
            <select
              value={selectedTeachFilter}
              onChange={(e) => setSelectedTeachFilter(e.target.value)}
              className="bg-white border-2 border-black p-3 text-xs font-bold focus:outline-none min-w-[140px] w-full"
            >
              <option value="">Teaches: All</option>
              {allTeachSkills.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-600 flex-shrink-0" />
            <select
              value={selectedLearnFilter}
              onChange={(e) => setSelectedLearnFilter(e.target.value)}
              className="bg-white border-2 border-black p-3 text-xs font-bold focus:outline-none min-w-[140px] w-full"
            >
              <option value="">Wants to Learn: All</option>
              {allLearnSkills.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {(searchTerm || selectedLearnFilter || selectedTeachFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLearnFilter('');
                setSelectedTeachFilter('');
              }}
              className="px-4 py-2 border-2 border-black font-mono text-xs font-bold hover:bg-neutral-100 active:translate-y-0.5"
            >
              CLEAR
            </button>
          )}
        </div>
      </BrutalistCard>

      {/* Grid of Profile Cards */}
      {filteredProfiles.length === 0 ? (
        <BrutalistCard className="text-center p-12 bg-white">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-2" />
          <h3 className="text-xl font-bold font-mono">NO SWAP PARTNERS FOUND</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Try resetting your filters or modifying your search keyword.</p>
        </BrutalistCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map(profile => {
            const { score, isMutual, weTeachTheyWant, theyTeachWeWant } = getMatchAnalysis(profile);
            const requestState = activeRequests.find(r => r.receiverId === profile.id);

            return (
              <div key={profile.id} className="flex flex-col h-full">
                <BrutalistCard 
                  className="flex-1 flex flex-col justify-between border-4 border-black bg-white hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
                >
                
                {/* Header Profile Badge */}
                <div>
                  <div className="flex justify-between items-start gap-3">
                    <img 
                      src={profile.avatar} 
                      alt={profile.name} 
                      className="w-14 h-14 border-2 border-black bg-[#bef264]"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Compatibility Match Indicator Badge */}
                    <div className="text-right">
                      <span className={`inline-block text-xs font-mono font-black border-2 border-black px-2 py-0.5 ${
                        isMutual ? 'bg-[#bef264] text-black animate-pulse' : 'bg-slate-100 text-black'
                      }`}>
                        {score}% MATCH
                      </span>
                      {profile.location && (
                        <div className="text-[10px] text-slate-500 font-mono mt-1">{profile.location}</div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="mt-4">
                    <h3 className="text-lg font-black tracking-tight text-black uppercase leading-tight font-mono">{profile.name}</h3>
                    <p className="text-[11px] font-mono font-bold text-indigo-600 uppercase mt-0.5">{profile.college}</p>
                    <p className="text-xs text-slate-700 font-medium mt-3 leading-relaxed line-clamp-3 font-mono bg-slate-50 p-2 border border-slate-200">
                      "{profile.bio}"
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-slate-300">
                    
                    {/* Teaches skills */}
                    <div>
                      <span className="text-[9px] font-bold font-mono tracking-wider text-slate-400 block uppercase mb-1">Teaches:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.teachSkills.map(skill => {
                          const userWants = userProfile.learnSkills.includes(skill);
                          return (
                            <span 
                              key={skill} 
                              className={`text-[10px] font-black font-mono px-1.5 py-0.5 border border-black ${
                                userWants ? 'bg-indigo-100 text-indigo-800 border-indigo-900' : 'bg-slate-50 text-slate-700'
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Wants to Learn skills */}
                    <div>
                      <span className="text-[9px] font-bold font-mono tracking-wider text-slate-400 block uppercase mb-1">Wants:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.learnSkills.map(skill => {
                          const userTeaches = userProfile.teachSkills.includes(skill);
                          return (
                            <span 
                              key={skill} 
                              className={`text-[10px] font-black font-mono px-1.5 py-0.5 border border-black ${
                                userTeaches ? 'bg-[#bef264] text-black border-lime-900' : 'bg-slate-50 text-slate-700'
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Mutual Match Highlight info */}
                  {isMutual && (
                    <div className="mt-4 bg-[#bef264]/20 border-2 border-[#bef264] p-2.5 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 animate-spin" />
                      <p className="text-[10.5px] font-mono text-slate-800 leading-tight">
                        <strong>Mutual Match!</strong> You can trade <strong>{weTeachTheyWant[0]}</strong> for <strong>{theyTeachWeWant[0]}</strong>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Request Button */}
                <div className="mt-6 pt-3 border-t-2 border-black">
                  {requestState ? (
                    <div className="w-full text-center border-2 border-black py-2 text-xs font-mono font-black uppercase bg-slate-100 text-slate-600">
                      {requestState.status === 'pending' ? '⏳ Swap Request Sent' : '✅ Request Approved'}
                    </div>
                  ) : (
                    <BrutalistButton
                      variant={isMutual ? 'yellow' : 'white'}
                      size="sm"
                      className="w-full"
                      onClick={() => openRequestModal(profile)}
                    >
                      Propose SkillSwap
                    </BrutalistButton>
                  )}
                </div>

              </BrutalistCard>
            </div>
          );
          })}
        </div>
      )}

      {/* Propose Swap Modal */}
      {requestModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black max-w-md w-full p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
            
            {/* Close button */}
            <button 
              onClick={() => setRequestModalUser(null)}
              className="absolute right-4 top-4 border-2 border-black bg-red-400 p-1 hover:bg-red-500 active:translate-y-0.5 shadow-[2px_2px_0px_#000]"
            >
              ✕
            </button>

            <h3 className="text-xl font-black uppercase tracking-tight font-mono pr-8">
              Propose Swap with {requestModalUser.name}
            </h3>
            <p className="text-xs font-mono text-slate-500 mt-1 uppercase">{requestModalUser.college}</p>

            {/* Form */}
            <div className="mt-5 space-y-4 font-mono">
              
              <div>
                <label className="block text-xs font-black uppercase mb-1">Select Skill to Teach them:</label>
                <select
                  value={proposedSkill}
                  onChange={(e) => setProposedSkill(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                >
                  {userProfile.teachSkills.map(skill => (
                    <option key={skill} value={skill}>
                      {skill} {requestModalUser.learnSkills.includes(skill) ? '🌟 (They want this)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Select Skill to Learn from them:</label>
                <div className="bg-slate-50 p-2.5 border-2 border-black text-xs font-bold">
                  {requestModalUser.teachSkills[0]} 
                  <span className="text-[10px] text-slate-500 ml-1 block font-medium mt-1">
                    (You will learn this skill from {requestModalUser.name})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Personal Swap Proposal Note:</label>
                <textarea
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-white border-2 border-black p-3 text-xs font-bold focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <BrutalistButton
                  variant="black"
                  className="flex-1"
                  onClick={() => setRequestModalUser(null)}
                >
                  Cancel
                </BrutalistButton>
                
                <BrutalistButton
                  variant="yellow"
                  className="flex-1"
                  onClick={handleSendRequest}
                >
                  Send Proposal ⚡
                </BrutalistButton>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

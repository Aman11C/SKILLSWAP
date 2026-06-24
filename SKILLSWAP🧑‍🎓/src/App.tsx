import { useState, useEffect } from 'react';
import { Profile, MatchRequest, Message, StudyTeam } from './types';
import { 
  INITIAL_PROFILES, 
  INITIAL_TEAMS, 
  INITIAL_MESSAGES 
} from './data';
import Landing from './components/Landing';
import Browse from './components/Browse';
import Messenger from './components/Messenger';
import Groups from './components/Groups';
import ProfileEditor from './components/ProfileEditor';
import BrutalistButton from './components/BrutalistButton';
import { 
  Compass, 
  MessageSquare, 
  Users, 
  User, 
  LogOut, 
  ArrowLeft,
  Sparkles,
  Bell
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'landing' | 'explore' | 'messenger' | 'groups' | 'profile'>('landing');
  
  // Persistence States
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('skillswap_profiles');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [userProfile, setUserProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('skillswap_user');
    if (saved) return JSON.parse(saved);
    const userMe = INITIAL_PROFILES.find(p => p.id === 'user_me');
    return userMe || INITIAL_PROFILES[0];
  });

  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>(() => {
    const saved = localStorage.getItem('skillswap_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('skillswap_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [teams, setTeams] = useState<StudyTeam[]>(() => {
    const saved = localStorage.getItem('skillswap_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [systemAlert, setSystemAlert] = useState<string | null>(null);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('skillswap_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('skillswap_user', JSON.stringify(userProfile));
    // Keep user profile updated in profiles array as well
    setProfiles(prev => prev.map(p => p.id === 'user_me' ? userProfile : p));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('skillswap_requests', JSON.stringify(matchRequests));
  }, [matchRequests]);

  useEffect(() => {
    localStorage.setItem('skillswap_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('skillswap_teams', JSON.stringify(teams));
  }, [teams]);

  // Handler: Request a new match
  const handleRequestMatch = (receiverId: string, proposedSkill: string, messageText: string) => {
    const newRequest: MatchRequest = {
      id: `req_${Date.now()}`,
      senderId: 'user_me',
      receiverId,
      status: 'pending',
      proposedSkill,
      message: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMatchRequests(prev => [...prev, newRequest]);

    // Simulate peer approval response
    const peer = profiles.find(p => p.id === receiverId);
    if (!peer) return;

    setTimeout(() => {
      // 1. Mark request as accepted
      setMatchRequests(current => 
        current.map(r => r.id === newRequest.id ? { ...r, status: 'accepted' } : r)
      );

      // 2. Insert welcoming peer message to chat
      const acceptMsg: Message = {
        id: `msg_auto_${Date.now()}`,
        swapId: peer.id,
        senderId: peer.id,
        text: `Hey Aman! I accepted your SkillSwap request. I'd love to trade some of my ${peer.teachSkills[0]} knowledge for your ${proposedSkill}. Let's coordinate below!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(currMsg => [...currMsg, acceptMsg]);
      
      // 3. Highlight with banner alert
      setSystemAlert(`🎉 Swap Match Granted! ${peer.name} approved your proposal. Go to Chats to connect!`);
      
      // Clear alert after 6 seconds
      setTimeout(() => setSystemAlert(null), 6000);

    }, 3500);
  };

  // Handler: Send standard message in Messenger
  const handleSendMessage = (swapId: string, text: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      swapId,
      senderId: 'user_me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);

    // Setup smart responder bot based on active contact
    const recipient = profiles.find(p => p.id === swapId);
    if (!recipient) return;

    setTimeout(() => {
      let replyText = "That sounds like an amazing plan! When are you free to schedule a session?";
      
      if (recipient.id === 'profile_arpit') {
        replyText = "Awesome! That Figma auto-layout technique is super powerful once you grasp constraints. Let's do a live Google Meet slot this Friday evening around 6 PM?";
      } else if (recipient.id === 'profile_chaitanya') {
        replyText = "Perfect! I'll walk you through setting up Linux network monitoring, and I can explain memory allocation rules in Rust. What IDE do you use?";
      } else if (recipient.id === 'profile_meera') {
        replyText = "Super clean! We can streamline your ML data cleaning steps using pandas and vectorization operations. Let's look at your Jupyter notebook soon.";
      } else if (recipient.id === 'profile_devashish') {
        replyText = "Solid. Concurrency channels in Golang are awesome for scalable pipelines. Happy to write some test microservices together.";
      } else if (recipient.id === 'profile_riya') {
        replyText = "Excellent! Let's map out your Flutter widget hierarchy or Figma mockups. I'm excited for our swap session!";
      }

      const botMsg: Message = {
        id: `msg_bot_${Date.now()}`,
        swapId,
        senderId: recipient.id,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    }, 2000);
  };

  // Handler: Join a study team group
  const handleJoinTeam = (teamId: string) => {
    setTeams(prev => 
      prev.map(t => {
        if (t.id === teamId) {
          const joined = !t.joined;
          return {
            ...t,
            joined,
            membersCount: joined ? t.membersCount + 1 : t.membersCount - 1
          };
        }
        return t;
      })
    );
  };

  // Handler: Create custom study team
  const handleCreateTeam = (newTeamData: Omit<StudyTeam, 'id' | 'membersCount' | 'joined'>) => {
    const newTeam: StudyTeam = {
      ...newTeamData,
      id: `team_${Date.now()}`,
      membersCount: 1,
      joined: true
    };
    setTeams(prev => [newTeam, ...prev]);
  };

  // Save modified user profile
  const handleSaveUserProfile = (updated: Profile) => {
    setUserProfile(updated);
  };

  // Get active chat contacts (who have accepted requests or existing chats)
  const activeChats = profiles.filter(profile => {
    if (profile.id === 'user_me') return false;
    
    // Check if there is an accepted request with this profile
    const hasAcceptedRequest = matchRequests.some(
      r => (r.senderId === 'user_me' && r.receiverId === profile.id && r.status === 'accepted') ||
           (r.senderId === profile.id && r.receiverId === 'user_me' && r.status === 'accepted')
    );

    // Or check if they have existing default seed messages
    const hasSeedMessages = messages.some(m => m.swapId === profile.id);

    return hasAcceptedRequest || hasSeedMessages;
  });

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans flex flex-col">
      
      {/* Dynamic System Alert (Success matches) */}
      {systemAlert && (
        <div className="bg-[#bef264] border-b-4 border-black px-6 py-3 text-sm font-black font-mono text-black flex items-center justify-between z-50 sticky top-0 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-700 animate-spin" />
            <span>{systemAlert}</span>
          </div>
          <button 
            onClick={() => setSystemAlert(null)}
            className="border-2 border-black bg-white px-2 py-0.5 text-xs font-bold hover:bg-neutral-50"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Persistent Neo-Brutalist Nav-Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentTab('landing')} 
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-3xl font-black tracking-tighter uppercase font-mono">
              SKILL
            </span>
            <span className="text-3xl font-black tracking-tighter uppercase font-mono bg-[#bef264] border-4 border-black px-3 py-1.5 rotate-[-2deg] shadow-[3px_3px_0px_#000] inline-block">
              SWAP
            </span>
          </div>

          {/* Navigation Control Group */}
          <div className="flex flex-wrap items-center gap-2 font-mono">
            
            {currentTab !== 'landing' && (
              <button
                onClick={() => setCurrentTab('landing')}
                className="flex items-center gap-1 px-3 py-2 border-2 border-black text-xs font-bold bg-slate-100 hover:bg-neutral-200 shadow-[2px_2px_0px_#000] active:translate-y-0.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back Home
              </button>
            )}

            <button
              onClick={() => setCurrentTab('explore')}
              className={`px-4 py-2 border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000] active:translate-y-0.5 ${
                currentTab === 'explore' ? 'bg-[#bef264]' : 'bg-white hover:bg-neutral-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Discover peers
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('messenger')}
              className={`px-4 py-2 border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000] active:translate-y-0.5 relative ${
                currentTab === 'messenger' ? 'bg-[#bef264]' : 'bg-white hover:bg-neutral-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Active Chats
                {activeChats.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white border border-black rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold">
                    {activeChats.length}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('groups')}
              className={`px-4 py-2 border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000] active:translate-y-0.5 ${
                currentTab === 'groups' ? 'bg-[#bef264]' : 'bg-white hover:bg-neutral-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Teams
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('profile')}
              className={`px-4 py-2 border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000] active:translate-y-0.5 ${
                currentTab === 'profile' ? 'bg-[#bef264]' : 'bg-white hover:bg-neutral-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Profile
              </span>
            </button>

          </div>

          {/* Quick Profile Widget */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-black block font-mono">{userProfile.name}</span>
              <span className="text-[10px] text-slate-500 font-mono font-medium truncate max-w-[150px] block">{userProfile.college}</span>
            </div>
            <img 
              src={userProfile.avatar} 
              alt={userProfile.name} 
              onClick={() => setCurrentTab('profile')}
              className="w-10 h-10 border-2 border-black cursor-pointer bg-[#bef264] hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>
      </header>

      {/* Render Subview Content */}
      <main className="flex-1 flex flex-col bg-[#f4f4f0]">
        {currentTab === 'landing' && (
          <Landing 
            onStartSwapping={() => setCurrentTab('explore')}
            onAlreadyAccount={() => setCurrentTab('explore')}
          />
        )}
        
        {currentTab === 'explore' && (
          <Browse 
            profiles={profiles}
            userProfile={userProfile}
            onRequestMatch={handleRequestMatch}
            activeRequests={matchRequests}
          />
        )}

        {currentTab === 'messenger' && (
          <Messenger 
            activeChats={activeChats}
            messages={messages}
            onSendMessage={handleSendMessage}
            userProfile={userProfile}
          />
        )}

        {currentTab === 'groups' && (
          <Groups 
            teams={teams}
            onJoinTeam={handleJoinTeam}
            onCreateTeam={handleCreateTeam}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileEditor 
            profile={userProfile}
            onSave={handleSaveUserProfile}
          />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="border-t-4 border-black bg-black text-white py-6 select-none font-mono text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p className="text-slate-400">
            © 2026 SkillSwap Delhi Hub • Built for Hackathons & Mutual Peer Swaps.
          </p>
          <div className="flex gap-4">
            <a href="mailto:amanchouhan1196@gmail.com" className="hover:text-[#bef264] hover:underline">Contact Support</a>
            <span>•</span>
            <span className="text-slate-500">Local Time: June 24, 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

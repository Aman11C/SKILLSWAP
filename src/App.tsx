import { useState, useEffect } from 'react';
import { Profile, MatchRequest, Message, StudyTeam } from './types';
import Landing from './components/Landing';
import Browse from './components/Browse';
import Messenger from './components/Messenger';
import Groups from './components/Groups';
import ProfileEditor from './components/ProfileEditor';
import LoadingScreen from './components/LoadingScreen';
import ErrorBanner from './components/ErrorBanner';

// Import fallback data
import {
  INITIAL_PROFILES,
  INITIAL_TEAMS,
  INITIAL_MESSAGES
} from './data';

// Import Supabase and services
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  fetchAllProfiles,
  ensureUserProfile,
  upsertProfile
} from './services/profileService';
import {
  fetchAllTeams,
  createTeam,
  joinTeam,
  leaveTeam
} from './services/teamService';
import {
  fetchConnectionsForUser,
  createConnection,
  updateConnectionStatus,
  fetchMessagesForUser,
  sendMessage
} from './services/messageService';

import { 
  Compass, 
  MessageSquare, 
  Users, 
  User, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'landing' | 'explore' | 'messenger' | 'groups' | 'profile'>('landing');
  
  // States
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teams, setTeams] = useState<StudyTeam[]>([]);

  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load all data (Supabase or Mock)
  const initApp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        // Fallback to local mock data
        console.log('Using local mock data (Supabase not configured).');
        if (import.meta.env.PROD) {
          setError('Supabase is not configured on Vercel. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.');
        }
        const localUser = INITIAL_PROFILES.find(p => p.id === 'user_me') || INITIAL_PROFILES[0];
        setUserProfile(localUser);
        setProfiles(INITIAL_PROFILES);
        setTeams(INITIAL_TEAMS);
        setMessages(INITIAL_MESSAGES);
        setMatchRequests([]);
        setIsLoading(false);
        return;
      }

      // 1. Authenticate anonymously
      let userId = '';
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session) {
        userId = session.user.id;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) {
          throw new Error(`${authError.message}. Enable Anonymous sign-ins in Supabase Authentication settings.`);
        }
        userId = authData.user?.id || '';
      }

      if (!userId) {
        throw new Error('Authentication failed: No user ID established.');
      }

      // 2. Ensure profile exists for user in public.profiles table
      const profile = await ensureUserProfile(userId);
      setUserProfile(profile);

      // 3. Fetch all application data
      const [allProfiles, allTeams, allMessages, allConns] = await Promise.all([
        fetchAllProfiles(),
        fetchAllTeams(userId),
        fetchMessagesForUser(userId),
        fetchConnectionsForUser(userId)
      ]);

      setProfiles(allProfiles);
      setTeams(allTeams);
      setMessages(allMessages);
      setMatchRequests(allConns);
    } catch (err: any) {
      console.error('Initialization error:', err);
      setError(err.message || 'Failed to sync with database. Verify connection keys.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  // Handler: Request a new match
  const handleRequestMatch = async (receiverId: string, proposedSkill: string, messageText: string) => {
    if (!userProfile) return;
    
    // MOCK MODE
    if (!isSupabaseConfigured) {
      const newConn: MatchRequest = {
        id: `req_${Date.now()}`,
        senderId: userProfile.id,
        receiverId,
        status: 'pending',
        proposedSkill,
        message: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMatchRequests(prev => [...prev, newConn]);

      const peer = profiles.find(p => p.id === receiverId);
      if (!peer) return;

      setTimeout(() => {
        setMatchRequests(current => 
          current.map(r => r.id === newConn.id ? { ...r, status: 'accepted' } : r)
        );

        const acceptMsg: Message = {
          id: `msg_auto_${Date.now()}`,
          swapId: peer.id,
          senderId: peer.id,
          text: `Hey! I accepted your SkillSwap request. I'd love to trade some of my ${peer.teachSkills[0] || 'skills'} knowledge for your ${proposedSkill}. Let's coordinate below!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(currMsg => [...currMsg, acceptMsg]);
        setSystemAlert(`🎉 Swap Match Granted! ${peer.name} approved your proposal. Go to Chats to connect!`);
        setTimeout(() => setSystemAlert(null), 6000);
      }, 3500);
      return;
    }

    // SUPABASE MODE
    try {
      const newConn = await createConnection({
        senderId: userProfile.id,
        receiverId,
        status: 'pending',
        proposedSkill,
        message: messageText
      });

      setMatchRequests(prev => [...prev, newConn]);

      // Simulate peer approval response
      const peer = profiles.find(p => p.id === receiverId);
      if (!peer) return;

      setTimeout(async () => {
        try {
          await updateConnectionStatus(newConn.id, 'accepted');
          setMatchRequests(current => 
            current.map(r => r.id === newConn.id ? { ...r, status: 'accepted' } : r)
          );

          const acceptMsg: Message = {
            id: `msg_auto_${crypto.randomUUID()}`,
            swapId: peer.id,
            senderId: peer.id,
            text: `Hey! I accepted your SkillSwap request. I'd love to trade some of my ${peer.teachSkills[0] || 'skills'} knowledge for your ${proposedSkill}. Let's coordinate below!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages(currMsg => [...currMsg, acceptMsg]);
          setSystemAlert(`🎉 Swap Match Granted! ${peer.name} approved your proposal. Go to Chats to connect!`);
          setTimeout(() => setSystemAlert(null), 6000);
        } catch (simErr) {
          console.error('Error executing simulated accept:', simErr);
        }
      }, 3500);

    } catch (err: any) {
      setError(err.message || 'Failed to send match request.');
    }
  };

  // Handler: Send standard message in Messenger
  const handleSendMessage = async (swapId: string, text: string) => {
    if (!userProfile) return;

    // MOCK MODE
    if (!isSupabaseConfigured) {
      const newMsg: Message = {
        id: `msg_${Date.now()}`,
        swapId,
        senderId: userProfile.id,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, newMsg]);

      const recipient = profiles.find(p => p.id === swapId);
      if (!recipient) return;

      setTimeout(() => {
        let replyText = "That sounds like an amazing plan! When are you free to schedule a session?";
        
        if (recipient.id === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d') {
          replyText = "Awesome! That Figma auto-layout technique is super powerful once you grasp constraints. Let's do a live Google Meet slot this Friday evening around 6 PM?";
        } else if (recipient.id === 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f') {
          replyText = "Perfect! I'll walk you through setting up Linux network monitoring, and I can explain memory allocation rules in Rust. What IDE do you use?";
        } else if (recipient.id === 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e') {
          replyText = "Super clean! We can streamline your ML data cleaning steps using pandas and vectorization operations. Let's look at your Jupyter notebook soon.";
        } else if (recipient.id === 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b') {
          replyText = "Solid. Concurrency channels in Golang are awesome for scalable pipelines. Happy to write some test microservices together.";
        } else if (recipient.id === 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a') {
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
      return;
    }

    // SUPABASE MODE
    try {
      const newMsg = await sendMessage({
        senderId: userProfile.id,
        receiverId: swapId,
        text
      });

      setMessages(prev => [...prev, newMsg]);

      const recipient = profiles.find(p => p.id === swapId);
      if (!recipient) return;

      setTimeout(async () => {
        try {
          let replyText = "That sounds like an amazing plan! When are you free to schedule a session?";
          
          if (recipient.id === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d') {
            replyText = "Awesome! That Figma auto-layout technique is super powerful once you grasp constraints. Let's do a live Google Meet slot this Friday evening around 6 PM?";
          } else if (recipient.id === 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f') {
            replyText = "Perfect! I'll walk you through setting up Linux network monitoring, and I can explain memory allocation rules in Rust. What IDE do you use?";
          } else if (recipient.id === 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e') {
            replyText = "Super clean! We can streamline your ML data cleaning steps using pandas and vectorization operations. Let's look at your Jupyter notebook soon.";
          } else if (recipient.id === 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b') {
            replyText = "Solid. Concurrency channels in Golang are awesome for scalable pipelines. Happy to write some test microservices together.";
          } else if (recipient.id === 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a') {
            replyText = "Excellent! Let's map out your Flutter widget hierarchy or Figma mockups. I'm excited for our swap session!";
          }

          const botMsg: Message = {
            id: `msg_bot_${crypto.randomUUID()}`,
            swapId: recipient.id,
            senderId: recipient.id,
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages(prev => [...prev, botMsg]);
        } catch (botErr) {
          console.error('Error sending bot auto-response:', botErr);
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    }
  };

  // Handler: Join/Leave a study team
  const handleJoinTeam = async (teamId: string) => {
    if (!userProfile) return;

    // MOCK MODE
    if (!isSupabaseConfigured) {
      setTeams(prev => 
        prev.map(t => {
          if (t.id === teamId) {
            const joined = !t.joined;
            return {
              ...t,
              joined,
              membersCount: joined ? t.membersCount + 1 : Math.max(0, t.membersCount - 1)
            };
          }
          return t;
        })
      );
      return;
    }

    // SUPABASE MODE
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) return;

      if (team.joined) {
        await leaveTeam(teamId, userProfile.id);
        setTeams(prev => 
          prev.map(t => t.id === teamId ? { ...t, joined: false, membersCount: Math.max(0, t.membersCount - 1) } : t)
        );
      } else {
        await joinTeam(teamId, userProfile.id);
        setTeams(prev => 
          prev.map(t => t.id === teamId ? { ...t, joined: true, membersCount: t.membersCount + 1 } : t)
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join team.');
    }
  };

  // Handler: Create custom study team
  const handleCreateTeam = async (newTeamData: Omit<StudyTeam, 'id' | 'membersCount' | 'joined'>) => {
    if (!userProfile) return;

    // MOCK MODE
    if (!isSupabaseConfigured) {
      const newTeam: StudyTeam = {
        ...newTeamData,
        id: `team_${Date.now()}`,
        membersCount: 1,
        joined: true
      };
      setTeams(prev => [newTeam, ...prev]);
      return;
    }

    // SUPABASE MODE
    try {
      const created = await createTeam(newTeamData, userProfile.id);
      setTeams(prev => [created, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to create team.');
      throw err;
    }
  };

  // Save modified user profile
  const handleSaveUserProfile = async (updated: Profile) => {
    // MOCK MODE
    if (!isSupabaseConfigured) {
      setUserProfile(updated);
      setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
      return;
    }

    // SUPABASE MODE
    try {
      const savedProfile = await upsertProfile(updated);
      setUserProfile(savedProfile);
      setProfiles(prev => prev.map(p => p.id === savedProfile.id ? savedProfile : p));
    } catch (err: any) {
      setError(err.message || 'Failed to save profile changes.');
      throw err;
    }
  };

  // Get active chat contacts
  const activeChats = profiles.filter(profile => {
    if (!userProfile || profile.id === userProfile.id) return false;
    
    const hasAcceptedRequest = matchRequests.some(
      r => (r.senderId === userProfile.id && r.receiverId === profile.id && r.status === 'accepted') ||
           (r.senderId === profile.id && r.receiverId === userProfile.id && r.status === 'accepted')
    );

    const hasSeedMessages = messages.some(m => m.swapId === profile.id);

    return hasAcceptedRequest || hasSeedMessages;
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

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
          {userProfile && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-black block font-mono">{userProfile.name || 'Your Name'}</span>
                <span className="text-[10px] text-slate-500 font-mono font-medium truncate max-w-[150px] block">{userProfile.college || 'Student'}</span>
              </div>
              <img 
                src={userProfile.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&auto=format&fit=crop&q=80'} 
                alt={userProfile.name || 'Your Name'} 
                onClick={() => setCurrentTab('profile')}
                className="w-10 h-10 border-2 border-black cursor-pointer bg-[#bef264] hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

        </div>
      </header>

      {/* Async Error Banner */}
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      {/* Render Subview Content */}
      <main className="flex-1 flex flex-col bg-[#f4f4f0]">
        {currentTab === 'landing' && (
          <Landing 
            onStartSwapping={() => setCurrentTab('explore')}
            onAlreadyAccount={() => setCurrentTab('explore')}
          />
        )}
        
        {currentTab === 'explore' && userProfile && (
          <Browse 
            profiles={profiles}
            userProfile={userProfile}
            onRequestMatch={handleRequestMatch}
            activeRequests={matchRequests}
          />
        )}

        {currentTab === 'messenger' && userProfile && (
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
            userProfile={userProfile}
          />
        )}

        {currentTab === 'profile' && userProfile && (
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
            <a href="mailto:support@skillswap.app" className="hover:text-[#bef264] hover:underline">Contact Support</a>
            <span>•</span>
            <span className="text-slate-500">Local Time: June 24, 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Profile } from '../types';
import { postSchema } from '../lib/schemas';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fetchPosts, createPost, deletePost, Post } from '../services/postService';
import BrutalistCard from './BrutalistCard';
import BrutalistButton from './BrutalistButton';
import toast from 'react-hot-toast';
import { Sparkles, Trophy, MessageSquare, Users, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface DashboardProps {
  userProfile: Profile;
  setCurrentTab: (tab: any) => void;
  activeChatsCount: number;
}

export default function Dashboard({ userProfile, setCurrentTab, activeChatsCount }: DashboardProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    if (!isSupabaseConfigured) {
      // Fallback mock posts
      setPosts([
        {
          id: 'mock-1',
          userId: 'some-user',
          title: 'Need help with Rust smart pointers',
          content: 'I am struggling to understand Rc, Arc, and RefCell. Happy to teach React state management or CSS layout in exchange.',
          skills: ['Rust', 'Systems'],
          createdAt: 'Jun 28',
          profiles: {
            name: 'Chaitanya K.',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            college: 'IIT Bombay'
          }
        },
        {
          id: 'mock-2',
          userId: 'some-user-2',
          title: 'Figma Auto-layout session',
          content: 'Let\'s run a quick 1-hour session on Figma constraints and grids. I want to learn basic Python scripting.',
          skills: ['Figma', 'UI Design'],
          createdAt: 'Jun 27',
          profiles: {
            name: 'Arpit Bhardwaj',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            college: 'NSUT Delhi'
          }
        }
      ]);
      return;
    }
    const data = await fetchPosts();
    setPosts(data);
  };

  useEffect(() => {
    loadPosts();

    if (!isSupabaseConfigured) return;

    // Realtime subscription for posts
    const channel = supabase
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: { title: '', content: '', skills: '' }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const skillsArray = data.skills
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      if (!isSupabaseConfigured) {
        // Add to local mock posts
        const newPost: Post = {
          id: `post-${Date.now()}`,
          userId: userProfile.id,
          title: data.title,
          content: data.content,
          skills: skillsArray,
          createdAt: 'Just now',
          profiles: {
            name: userProfile.name,
            avatar: userProfile.avatar,
            college: userProfile.college
          }
        };
        setPosts(prev => [newPost, ...prev]);
        toast.success('Mock post created.');
      } else {
        await createPost({
          userId: userProfile.id,
          title: data.title,
          content: data.content,
          skills: skillsArray
        });
        toast.success('Post published successfully.');
      }
      setIsPostOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish post.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      if (!isSupabaseConfigured) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Mock post deleted.');
      } else {
        await deletePost(postId);
        toast.success('Post deleted.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete post.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 text-left">
      {/* Welcome Banner */}
      <div className="bg-[#bef264] border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase font-mono tracking-tight leading-none">
            Welcome back, {userProfile.name || 'Hacker'}!
          </h2>
          <p className="text-sm font-mono mt-2 text-slate-800 font-bold">
            Here's what's happening at {userProfile.college || 'your college hub'}.
          </p>
        </div>
        <BrutalistButton variant="black" onClick={() => setIsPostOpen(true)}>
          <Plus className="w-4 h-4" /> Ask for a Swap
        </BrutalistButton>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
        <BrutalistCard variant="white" className="p-4 border-4 border-black shadow-[4px_4px_0px_#000] flex items-center gap-4">
          <div className="p-3 bg-[#bef264] border-2 border-black">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Feedback Rating</span>
            <span className="text-lg font-black">{userProfile.rating || 5.0} / 5.0</span>
          </div>
        </BrutalistCard>

        <BrutalistCard variant="white" className="p-4 border-4 border-black shadow-[4px_4px_0px_#000] flex items-center gap-4">
          <div className="p-3 bg-blue-400 border-2 border-black text-white">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Active Chats</span>
            <span className="text-lg font-black">{activeChatsCount} Contacts</span>
          </div>
        </BrutalistCard>

        <BrutalistCard variant="white" className="p-4 border-4 border-black shadow-[4px_4px_0px_#000] flex items-center gap-4">
          <div className="p-3 bg-pink-400 border-2 border-black text-white">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Matches Made</span>
            <span className="text-lg font-black">{userProfile.matchesCount || 0} Connections</span>
          </div>
        </BrutalistCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Swapping Bulletin Board (Span 8) */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-lg font-black font-mono tracking-wider text-slate-500 uppercase">
            SWAPPING BULLETIN BOARD
          </h3>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <BrutalistCard className="text-center p-12 bg-white border-4 border-black">
                <p className="text-sm font-mono text-slate-500 font-bold">
                  No swap postings on the bulletin board. Be the first to post!
                </p>
              </BrutalistCard>
            ) : (
              posts.map((post) => (
                <BrutalistCard
                  key={post.id}
                  className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.profiles?.avatar || 'https://api.dicebear.com/7.x/pixel-art/svg'}
                          alt={post.profiles?.name}
                          className="w-10 h-10 border-2 border-black bg-[#bef264]"
                        />
                        <div>
                          <h4 className="text-xs font-black uppercase font-mono">{post.profiles?.name}</h4>
                          <span className="text-[9px] font-mono text-indigo-600 font-bold block leading-none">
                            {post.profiles?.college}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{post.createdAt}</span>
                      </div>
                    </div>

                    <h4 className="text-md font-black uppercase font-mono mt-3 text-black leading-tight">
                      {post.title}
                    </h4>
                    <p className="text-xs font-sans font-medium text-slate-700 mt-2 bg-slate-50 p-2.5 border border-slate-200 leading-relaxed">
                      "{post.content}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                    <div className="flex flex-wrap gap-1.5">
                      {post.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[9px] font-black font-mono border border-black bg-slate-50 px-1.5 py-0.5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {post.userId === userProfile.id && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-500 hover:text-red-700 p-1 border-2 border-transparent hover:border-black bg-white transition-all active:translate-y-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </BrutalistCard>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick shortcuts (Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-lg font-black font-mono tracking-wider text-slate-500 uppercase">
            QUICK ACTIONS
          </h3>

          <BrutalistCard className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_#000] space-y-3 font-mono">
            <h4 className="text-xs font-black uppercase tracking-wider mb-2">Navigation Shortcuts</h4>
            
            <BrutalistButton variant="white" className="w-full text-xs justify-start" onClick={() => setCurrentTab('explore')}>
              ⚡ Discover Swap Peers
            </BrutalistButton>
            
            <BrutalistButton variant="white" className="w-full text-xs justify-start" onClick={() => setCurrentTab('groups')}>
              👥 Joint Study squads
            </BrutalistButton>

            <BrutalistButton variant="white" className="w-full text-xs justify-start" onClick={() => setCurrentTab('profile')}>
              ⚙️ Modify Swap Profile
            </BrutalistButton>
          </BrutalistCard>
        </div>
      </div>

      {/* Ask for a Swap Modal */}
      {isPostOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black max-w-md w-full p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
            <button
              onClick={() => setIsPostOpen(false)}
              className="absolute right-4 top-4 border-2 border-black bg-red-400 p-1 hover:bg-red-500 active:translate-y-0.5 shadow-[2px_2px_0px_#000]"
            >
              ✕
            </button>

            <h3 className="text-xl font-black uppercase tracking-tight font-mono mb-4">
              Publish Swap Request
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-mono text-left">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Request Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Master C++ Pointers and memory layout"
                  {...register('title')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {errors.title && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Post content / proposal:</label>
                <textarea
                  rows={4}
                  placeholder="Tell peers what you want to learn, what you can teach in return, and how to reach you..."
                  {...register('content')}
                  className="w-full bg-white border-2 border-black p-3 text-xs font-bold focus:outline-none"
                />
                {errors.content && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.content.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Related Skills (comma separated):</label>
                <input
                  type="text"
                  placeholder="e.g. C++, React, Web Design"
                  {...register('skills')}
                  className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
                />
                {errors.skills && (
                  <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.skills.message}
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <BrutalistButton variant="black" className="flex-1" type="button" onClick={() => setIsPostOpen(false)}>
                  Cancel
                </BrutalistButton>
                <BrutalistButton variant="yellow" className="flex-1" type="submit" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Post 🚀'}
                </BrutalistButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

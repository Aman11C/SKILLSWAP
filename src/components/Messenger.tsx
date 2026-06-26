import React, { useState, useRef, useEffect } from 'react';
import { Profile, Message } from '../types';
import { Send, Laptop, Sparkles, MessageSquare, CheckCheck, Play } from 'lucide-react';
import BrutalistCard from './BrutalistCard';
import BrutalistButton from './BrutalistButton';

interface MessengerProps {
  activeChats: Profile[];
  messages: Message[];
  onSendMessage: (swapId: string, text: string) => void;
  userProfile: Profile;
}

export default function Messenger({ activeChats, messages, onSendMessage, userProfile }: MessengerProps) {
  const [selectedChat, setSelectedChat] = useState<Profile | null>(activeChats[0] || null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fallback if the selected chat was removed or isn't set, default to first available
  useEffect(() => {
    if (!selectedChat && activeChats.length > 0) {
      setSelectedChat(activeChats[0]);
    }
  }, [activeChats, selectedChat]);

  // Scroll to bottom on load/new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedChat) return;
    onSendMessage(selectedChat.id, inputText.trim());
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Filter messages for selected chat
  const chatMessages = selectedChat 
    ? messages.filter(m => m.swapId === selectedChat.id) 
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-[calc(100vh-120px)] space-y-4">
      
      {/* Banner */}
      <div className="bg-[#db2777] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase leading-none">Swap Communication Hub</h2>
          <p className="text-xs font-mono mt-1 text-pink-100">Coordinate and schedule peer-to-peer tutoring slots.</p>
        </div>
      </div>

      {activeChats.length === 0 ? (
        <BrutalistCard className="text-center p-12 bg-white flex-1 flex flex-col justify-center items-center">
          <MessageSquare className="w-16 h-16 text-slate-300 mb-2" />
          <h3 className="text-lg font-black font-mono">NO ACTIVE SWAPS YET</h3>
          <p className="text-xs text-slate-500 font-mono mt-1 max-w-sm mx-auto leading-relaxed">
            Go to the <strong className="underline">Explore Hub</strong>, select a student, and propose a SkillSwap. Once they accept, they will appear here!
          </p>
        </BrutalistCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 items-stretch">
          
          {/* Left panel: active chat list (Span 4) */}
          <div className="md:col-span-4 space-y-3 flex flex-col">
            <span className="text-xs font-black font-mono tracking-wider text-slate-500 uppercase">ACTIVE SWAPS</span>
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
              {activeChats.map(profile => {
                const isActive = selectedChat?.id === profile.id;
                const lastMsg = messages.filter(m => m.swapId === profile.id).slice(-1)[0];
                
                return (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedChat(profile)}
                    className={`p-3 border-2 border-black flex gap-3 items-center cursor-pointer select-none transition-all duration-100 ${
                      isActive 
                        ? 'bg-[#bef264] shadow-[3px_3px_0px_#000] translate-x-[-1px] translate-y-[-1px]' 
                        : 'bg-white hover:bg-neutral-50 shadow-[1px_1px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000]'
                    }`}
                  >
                    <img 
                      src={profile.avatar} 
                      alt={profile.name} 
                      className="w-10 h-10 border border-black bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase truncate font-mono">{profile.name}</span>
                        <span className="text-[9px] font-mono font-medium text-slate-500">
                          {lastMsg ? lastMsg.timestamp : 'Active'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
                        Trading <strong className="text-black">{profile.teachSkills[0]}</strong> for <strong className="text-black">{profile.learnSkills[0]}</strong>
                      </p>
                      {lastMsg && (
                        <p className="text-[10px] text-slate-700 truncate font-sans mt-1">
                          {lastMsg.senderId === userProfile.id ? 'You: ' : ''}{lastMsg.text}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Live Messenger Area (Span 8) */}
          <div className="md:col-span-8 flex flex-col justify-between border-4 border-black bg-white shadow-[6px_6px_0px_0px_#000]">
            
            {selectedChat ? (
              <>
                {/* Active Chat Header */}
                <div className="border-b-4 border-black p-4 bg-slate-50 flex justify-between items-center flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedChat.avatar} 
                      alt={selectedChat.name} 
                      className="w-10 h-10 border-2 border-black"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-xs font-black uppercase font-mono">{selectedChat.name}</h3>
                      <p className="text-[9px] font-mono text-indigo-600 uppercase font-semibold leading-none">{selectedChat.college}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-[#bef264] border-2 border-black px-2 py-0.5 text-[9px] font-black font-mono uppercase">
                      TRADING: {selectedChat.teachSkills[0]} ↔ {selectedChat.learnSkills[0]}
                    </span>
                  </div>
                </div>

                {/* Messages scroll stage */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[300px] max-h-[400px] bg-slate-50">
                  
                  {chatMessages.map(msg => {
                    const isMe = msg.senderId === userProfile.id;
                    return (
                      <div 
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`p-3 text-xs max-w-[80%] border-2 border-black font-sans ${
                          isMe 
                            ? 'bg-[#2563eb] text-white shadow-[2px_2px_0px_#000]' 
                            : 'bg-white text-black shadow-[2px_2px_0px_#000]'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />

                </div>

                {/* Keyboard Input bar */}
                <div className="border-t-4 border-black p-4 bg-white flex gap-3 items-center flex-shrink-0">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Write a message to ${selectedChat.name}...`}
                    className="flex-1 bg-white border-2 border-black p-3 text-xs font-mono font-bold focus:outline-none placeholder:text-slate-400"
                  />
                  <BrutalistButton
                    variant="yellow"
                    size="md"
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </BrutalistButton>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 font-mono text-center">
                <Laptop className="w-12 h-12 text-slate-300 mb-2" />
                Select a chat to begin exchanging.
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

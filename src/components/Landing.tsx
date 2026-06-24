import BrutalistButton from './BrutalistButton';
import BrutalistCard from './BrutalistCard';

interface LandingProps {
  onStartSwapping: () => void;
  onAlreadyAccount: () => void;
}

export default function Landing({ onStartSwapping, onAlreadyAccount }: LandingProps) {
  const marqueeSkills = [
    'RUST', 'FIGMA', 'CYBERSECURITY', 'DATA SCIENCE', 'MOBILE', 'WEB3', 'GOLANG', 'REACT',
    'RUST', 'FIGMA', 'CYBERSECURITY', 'DATA SCIENCE', 'MOBILE', 'WEB3', 'GOLANG', 'REACT'
  ];

  return (
    <div className="bg-white min-h-[calc(100vh-70px)] flex flex-col justify-between overflow-hidden relative selection:bg-[#bef264]">
      
      {/* Hero Body Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full flex-1">
        
        {/* Left Column - Hero Text (Span 7) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col items-start">
          
          {/* Hackathon badge */}
          <div className="inline-flex items-center gap-2 bg-[#ff2a85] text-white px-3 py-1 text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            HACKATHON-READY • STUDENT-BUILT
          </div>

          {/* Core Loud Typography */}
          <div className="space-y-2 select-none">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black leading-none uppercase">
              LEARN.
            </h2>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black leading-none uppercase">
              TEACH.
            </h2>
            <div className="inline-block bg-[#bef264] border-4 border-black px-4 py-2 mt-2 rotate-[-1deg] shadow-[4px_4px_0px_#000]">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-black leading-none uppercase">
                BUILD TOGETHER.
              </h2>
            </div>
          </div>

          {/* Description */}
          <p className="text-base md:text-xl font-medium text-slate-800 max-w-xl leading-relaxed font-mono">
            SkillSwap matches students by what they <strong className="bg-[#bef264]/40 px-1">teach</strong> and what they <strong className="bg-[#bef264]/40 px-1">learn</strong>. Find hackathon teammates, co-founders, and project collaborators — fast.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <BrutalistButton 
              id="start-swapping-btn"
              variant="yellow" 
              size="lg"
              onClick={onStartSwapping}
            >
              Start Swapping →
            </BrutalistButton>
            
            <BrutalistButton 
              id="already-account-btn"
              variant="blue" 
              size="lg"
              onClick={onAlreadyAccount}
            >
              I Already Have An Account
            </BrutalistButton>
          </div>

        </div>

        {/* Right Column - Stats Card (Span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          <BrutalistCard 
            variant="white" 
            className="w-full max-w-md border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] bg-white"
          >
            <div className="border-b-2 border-black pb-3 mb-6 flex justify-between items-center">
              <span className="text-xs font-bold font-mono tracking-wider text-slate-500">LIVE STATS</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
            </div>

            <div className="space-y-5 font-mono">
              <div className="flex justify-between items-end border-b border-dashed border-slate-300 pb-2">
                <span className="text-sm font-semibold text-slate-700">Skills Indexed</span>
                <span className="text-2xl font-black text-black">12K+</span>
              </div>
              
              <div className="flex justify-between items-end border-b border-dashed border-slate-300 pb-2">
                <span className="text-sm font-semibold text-slate-700">Active Teams</span>
                <span className="text-2xl font-black text-black">480</span>
              </div>

              <div className="flex justify-between items-end border-b border-dashed border-slate-300 pb-2">
                <span className="text-sm font-semibold text-slate-700">Colleges Joined</span>
                <span className="text-2xl font-black text-black">90+</span>
              </div>

              <div className="flex justify-between items-end pb-2">
                <span className="text-sm font-semibold text-slate-700">Avg. Match Time</span>
                <span className="text-2xl font-black text-black">~3min</span>
              </div>
            </div>

            {/* Bottom mini decor badge */}
            <div className="mt-6 bg-[#bef264] border-2 border-black p-3 text-center text-xs font-black tracking-tight uppercase font-mono">
              ⚡ LIVE MATCHING IS CURRENTLY ACTIVE
            </div>
          </BrutalistCard>
        </div>

      </div>

      {/* Marquee Ticker Banner at the very bottom */}
      <div className="bg-[#bef264] border-t-4 border-b-4 border-black py-4 overflow-hidden flex items-center select-none">
        <div className="flex whitespace-nowrap animate-marquee">
          {marqueeSkills.map((skill, index) => (
            <span key={index} className="inline-flex items-center text-xl md:text-2xl font-black uppercase text-black tracking-wider mx-6">
              {skill}
              <span className="ml-12 text-black text-3xl font-black">•</span>
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}

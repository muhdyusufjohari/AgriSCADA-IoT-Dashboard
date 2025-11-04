
import React from 'react';

interface WaterTankProps {
  level: number; // Percentage from 0 to 100
}

const WaterTank: React.FC<WaterTankProps> = ({ level }) => {
  const safeLevel = Math.max(0, Math.min(100, level));
  
  let waterColorClass = 'from-blue-500 to-cyan-400';
  if (safeLevel < 20) {
    waterColorClass = 'from-red-600 to-orange-500';
  } else if (safeLevel < 50) {
    waterColorClass = 'from-amber-500 to-yellow-400';
  }

  return (
    <div className="w-40 h-64 bg-slate-700/50 rounded-xl border-4 border-slate-600 flex flex-col justify-end relative overflow-hidden shadow-inner">
      {/* Water level */}
      <div
        className={`bg-gradient-to-t ${waterColorClass} transition-all duration-1000 ease-in-out`}
        style={{ height: `${safeLevel}%` }}
      >
        {/* Waves effect */}
        <div className="absolute bottom-0 w-full h-4 bg-black/10 opacity-50 transform-gpu animate-pulse-slow"></div>
      </div>
      
      {/* Level indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-extrabold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {safeLevel.toFixed(0)}%
        </span>
      </div>

      {/* Markings */}
       <div className="absolute top-0 right-0 h-full w-2 flex flex-col justify-between py-2">
        {[100, 75, 50, 25, 0].map(mark => (
          <div key={mark} className="h-px bg-slate-400 w-full" style={{ position: 'absolute', bottom: `${mark}%` }}></div>
        ))}
      </div>
    </div>
  );
};

export default WaterTank;


import React from 'react';

interface HeaderProps {
  isOnline: boolean;
}

const Header: React.FC<HeaderProps> = ({ isOnline }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold tracking-wider text-white">
          <span className="text-brand-green">Agri</span>SCADA IoT Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <span className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className={`text-sm font-semibold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;

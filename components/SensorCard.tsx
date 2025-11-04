
import React from 'react';
import { FieldStatus } from '../types';

interface SensorCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: FieldStatus;
}

const statusColors = {
  ok: 'from-slate-800 to-slate-900 border-slate-700',
  alert: 'from-amber-900/30 to-slate-900 border-amber-600',
  danger: 'from-red-900/30 to-slate-900 border-red-600',
};

const iconColors = {
    ok: 'text-brand-green',
    alert: 'text-brand-amber',
    danger: 'text-brand-red',
}

const SensorCard: React.FC<SensorCardProps> = ({ icon, label, value, status }) => {
  return (
    <div className={`bg-gradient-to-br ${statusColors[status]} p-6 rounded-2xl shadow-lg border transition-all duration-300 flex items-center space-x-4`}>
      <div className={`p-3 bg-slate-900/50 rounded-full ${iconColors[status]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default SensorCard;

import React, { useState, useEffect } from 'react';
import { ConfigurableSensor } from '../types';

interface SensorEditModalProps {
  sensor: ConfigurableSensor | null;
  onClose: () => void;
  onSave: (sensorId: string, newName: string) => void;
}

const SensorEditModal: React.FC<SensorEditModalProps> = ({ sensor, onClose, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (sensor) {
      setName(sensor.name);
    }
  }, [sensor]);

  if (!sensor) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(sensor.id, name.trim());
      onClose();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSave();
    } else if (e.key === 'Escape') {
        onClose();
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
        onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-sensor-title"
      >
        <h2 id="edit-sensor-title" className="text-2xl font-bold mb-6 text-white">Edit Sensor</h2>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="sensorName" className="text-sm font-semibold text-slate-400">Sensor Name</label>
          <input
            id="sensorName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-900/70 border border-slate-600 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-brand-green focus:outline-none"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
            <button 
                onClick={onClose}
                className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="bg-brand-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors"
            >
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default SensorEditModal;

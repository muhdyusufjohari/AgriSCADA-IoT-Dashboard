import React, { useState } from 'react';
import { ConfigurableSensor, SensorType, PlacedSensor } from '../types';

interface SensorConfiguratorProps {
  sensors: ConfigurableSensor[];
  setSensors: React.Dispatch<React.SetStateAction<ConfigurableSensor[]>>;
  placedSensors: PlacedSensor[];
  setPlacedSensors: React.Dispatch<React.SetStateAction<PlacedSensor[]>>;
  onSaveSettings: () => void;
}

const SensorConfigurator: React.FC<SensorConfiguratorProps> = ({ sensors, setSensors, placedSensors, setPlacedSensors, onSaveSettings }) => {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<SensorType>('status');

  const handleAddSensor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() === '') return;

    const newSensor: ConfigurableSensor = {
      id: `sensor_${Date.now()}`,
      name: newName.trim(),
      type: newType,
      status: 'ok',
      value: newType === 'temperature' ? '25.0°C' : newType === 'moisture' ? '60.0%' : 'Ok',
    };

    setSensors(prev => [...prev, newSensor]);
    setNewName('');
    setNewType('status');
  };
  
  const handleRemoveSensor = (id: string) => {
      setSensors(prev => prev.filter(s => s.id !== id));
      // Also remove from placed sensors if it exists
      setPlacedSensors(prev => prev.filter(ps => ps.sensorId !== id));
  };

  const handleSaveClick = () => {
    if (window.confirm('Are you sure you want to save the current sensor configuration and map layout?')) {
      onSaveSettings();
    }
  };

  return (
    <div className="bg-slate-800/60 p-6 rounded-2xl shadow-2xl border border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-slate-300">Sensor Configuration</h3>
      
      <form onSubmit={handleAddSensor} className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New sensor name"
          className="bg-slate-900/70 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as SensorType)}
          className="bg-slate-900/70 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
        >
          <option value="status">Status</option>
          <option value="temperature">Temperature</option>
          <option value="moisture">Moisture</option>
        </select>
        <button type="submit" className="bg-brand-green hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
          Add Sensor
        </button>
      </form>

      <button
        onClick={handleSaveClick}
        className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors mb-4"
      >
        Save Settings
      </button>
      
      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
        {sensors.length === 0 && <p className="text-sm text-slate-500 text-center">No sensors configured.</p>}
        {sensors.map(sensor => {
            const isPlaced = placedSensors.some(ps => ps.sensorId === sensor.id);
            return (
              <div key={sensor.id} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isPlaced ? 'bg-green-400' : 'bg-slate-500'}`} title={isPlaced ? 'Placed' : 'Not Placed'}></span>
                    <span className="text-sm">{sensor.name}</span>
                </div>
                <button onClick={() => handleRemoveSensor(sensor.id)} className="text-slate-500 hover:text-red-500 transition-colors text-xs font-bold">
                  X
                </button>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default SensorConfigurator;
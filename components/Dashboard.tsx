import React from 'react';
import { AmbientSensorData, ConfigurableSensor, PlacedSensor } from '../types';
import SensorCard from './SensorCard';
import WaterTank from './WaterTank';
import FarmMap from './FarmMap';
import SensorConfigurator from './SensorConfigurator';
import { TemperatureIcon, HumidityIcon, SoilMoistureIcon } from './icons';

interface DashboardProps {
  ambientSensorData: AmbientSensorData;
  configurableSensors: ConfigurableSensor[];
  setConfigurableSensors: React.Dispatch<React.SetStateAction<ConfigurableSensor[]>>;
  placedSensors: PlacedSensor[];
  setPlacedSensors: React.Dispatch<React.SetStateAction<PlacedSensor[]>>;
  mapImage: string | null;
  setMapImage: React.Dispatch<React.SetStateAction<string | null>>;
  onSaveSettings: () => void;
  mapZoom: number;
  setMapZoom: React.Dispatch<React.SetStateAction<number>>;
  mapPanOffset: { x: number; y: number };
  setMapPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  onEditSensor: (sensorId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    ambientSensorData,
    configurableSensors,
    setConfigurableSensors,
    placedSensors,
    setPlacedSensors,
    mapImage,
    setMapImage,
    onSaveSettings,
    mapZoom,
    setMapZoom,
    mapPanOffset,
    setMapPanOffset,
    onEditSensor,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-1 md:col-span-2 flex flex-col gap-6">
        <SensorCard
          icon={<TemperatureIcon />}
          label="Ambient Temperature"
          value={`${ambientSensorData.temperature}°C`}
          status={ambientSensorData.temperature > 35 ? 'danger' : ambientSensorData.temperature > 30 ? 'alert' : 'ok'}
        />
        <SensorCard
          icon={<HumidityIcon />}
          label="Air Humidity"
          value={`${ambientSensorData.humidity}%`}
          status={ambientSensorData.humidity > 85 ? 'alert' : 'ok'}
        />
        <SensorCard
          icon={<SoilMoistureIcon />}
          label="Avg. Soil Moisture"
          value={`${ambientSensorData.soilMoisture}%`}
          status={ambientSensorData.soilMoisture < 30 ? 'danger' : ambientSensorData.soilMoisture < 40 ? 'alert' : 'ok'}
        />
        <SensorConfigurator
            sensors={configurableSensors}
            setSensors={setConfigurableSensors}
            placedSensors={placedSensors}
            setPlacedSensors={setPlacedSensors}
            onSaveSettings={onSaveSettings}
        />
      </div>

      <div className="lg:col-span-3 md:col-span-2 bg-slate-800/60 p-6 rounded-2xl shadow-2xl border border-slate-700 min-h-[400px] lg:min-h-[600px] flex flex-col">
        <h2 className="text-lg font-bold mb-4 text-slate-300">Farm Overview</h2>
        <FarmMap
            configurableSensors={configurableSensors}
            placedSensors={placedSensors}
            setPlacedSensors={setPlacedSensors}
            mapImage={mapImage}
            setMapImage={setMapImage}
            onSaveSettings={onSaveSettings}
            zoom={mapZoom}
            setZoom={setMapZoom}
            panOffset={mapPanOffset}
            setPanOffset={setMapPanOffset}
            onEditSensor={onEditSensor}
        />
      </div>

      <div className="lg:col-span-1 md:col-span-2 bg-slate-800/60 p-6 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center justify-center min-h-[400px] lg:min-h-[600px]">
        <h2 className="text-lg font-bold mb-4 text-slate-300">Irrigation Tank</h2>
        <WaterTank level={ambientSensorData.waterTankLevel} />
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import SensorEditModal from './components/SensorEditModal';
import { AmbientSensorData, ConfigurableSensor, PlacedSensor } from './types';

// --- MOCK DATA ---
// This data is used to populate the dashboard on the user's first visit.
const initialSensors: ConfigurableSensor[] = [
  { id: 'sensor_1720000000001', name: 'Greenhouse Temp', type: 'temperature', status: 'ok', value: '28.1°C' },
  { id: 'sensor_1720000000002', name: 'North Field Pump', type: 'status', status: 'ok', value: 'Active' },
  { id: 'sensor_1720000000003', name: 'South Field Soil', type: 'moisture', status: 'alert', value: '38.5%' },
  { id: 'sensor_1720000000004', name: 'Main Well Level', type: 'status', status: 'danger', value: 'Low' },
];

// Sensors now start unplaced to encourage user interaction.
const initialPlacedSensors: PlacedSensor[] = [];
// --- END MOCK DATA ---

// A custom hook to debounce a value. This prevents excessive writes to localStorage during rapid interactions like panning.
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


const App: React.FC = () => {
  const [ambientSensorData, setAmbientSensorData] = useState<AmbientSensorData>({
    temperature: 24.5,
    humidity: 68,
    soilMoisture: 55,
    waterTankLevel: 75,
  });
  
  // State for user-defined sensors and their map positions
  const [configurableSensors, setConfigurableSensors] = useState<ConfigurableSensor[]>([]);
  const [placedSensors, setPlacedSensors] = useState<PlacedSensor[]>([]);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPanOffset, setMapPanOffset] = useState({ x: 0, y: 0 });
  
  const [editingSensorId, setEditingSensorId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState(false); // Track if initial load is complete

  // Debounce map view changes to auto-save them efficiently
  const debouncedMapView = useDebounce({ zoom: mapZoom, panOffset: mapPanOffset }, 500);

  // Load state from localStorage on initial render, or use mock data
  useEffect(() => {
    try {
      const savedMap = localStorage.getItem('farmMapImage');
      const savedSensors = localStorage.getItem('configurableSensors');
      const savedPlacedSensors = localStorage.getItem('placedSensors');
      const savedMapView = localStorage.getItem('farmMapView');

      if (savedMap) setMapImage(savedMap);
      
      if (savedMapView) {
        const { zoom, panOffset } = JSON.parse(savedMapView);
        setMapZoom(zoom || 1);
        setMapPanOffset(panOffset || { x: 0, y: 0 });
      }

      // If there are saved sensors, load them. Otherwise, initialize with mock data.
      if (savedSensors) {
        setConfigurableSensors(JSON.parse(savedSensors));
      } else {
        setConfigurableSensors(initialSensors);
      }
      
      // If there are saved placements, load them. Otherwise, initialize with mock data.
      if (savedPlacedSensors) {
        // Add a fallback for the new `scale` property for older saved configurations
        const parsedPlaced = JSON.parse(savedPlacedSensors).map((ps: any) => ({
          ...ps,
          scale: ps.scale || 1, // Default to 1 if scale is missing
        }));
        setPlacedSensors(parsedPlaced);
      } else {
        setPlacedSensors(initialPlacedSensors);
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    } finally {
        setIsLoaded(true); // Signal that initial loading is complete
    }
  }, []);
  
  // Auto-save map view state when it changes (debounced)
  useEffect(() => {
    if (!isLoaded) {
      return; // Don't save anything until the initial state has been loaded from storage
    }
    try {
      localStorage.setItem('farmMapView', JSON.stringify(debouncedMapView));
    } catch (error) {
      console.error("Failed to auto-save map view state to localStorage", error);
    }
  }, [debouncedMapView, isLoaded]);

  const handleSaveSettings = () => {
    try {
      if (mapImage) {
        localStorage.setItem('farmMapImage', mapImage);
      } else {
        localStorage.removeItem('farmMapImage');
      }
      localStorage.setItem('configurableSensors', JSON.stringify(configurableSensors));
      localStorage.setItem('placedSensors', JSON.stringify(placedSensors));
      // Also save the current map view for consistency with the explicit save action
      localStorage.setItem('farmMapView', JSON.stringify({ zoom: mapZoom, panOffset: mapPanOffset }));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
      alert('Error: Could not save settings.');
    }
  };

  const handleUpdateSensor = (sensorId: string, newName: string) => {
    setConfigurableSensors(prev => 
      prev.map(s => s.id === sensorId ? { ...s, name: newName } : s)
    );
  };


  // Simulation loop
  useEffect(() => {
    if (!isLoaded) return; // Don't start simulation until loaded
    const interval = setInterval(() => {
      // Simulate ambient data fluctuations
      setAmbientSensorData(prevData => ({
        temperature: parseFloat((prevData.temperature + (Math.random() - 0.5) * 0.2).toFixed(1)),
        humidity: Math.max(0, Math.min(100, Math.round(prevData.humidity + (Math.random() - 0.5) * 1))),
        soilMoisture: Math.max(0, Math.min(100, parseFloat((prevData.soilMoisture + (Math.random() - 0.5) * 0.5).toFixed(1)))),
        waterTankLevel: Math.max(0, Math.min(100, parseFloat((prevData.waterTankLevel + (Math.random() - 0.2) * 0.3).toFixed(1)))),
      }));

      // Simulate configurable sensor data fluctuations
      setConfigurableSensors(prevSensors => {
        return prevSensors.map(sensor => {
          const newStatus = Math.random() > 0.98 ? (['ok', 'alert', 'danger'] as const)[Math.floor(Math.random() * 3)] : sensor.status;
          let newValue = sensor.value;
          switch(sensor.type) {
            case 'temperature':
              let currentTemp = parseFloat(sensor.value) || 25;
              let newTemp = currentTemp + (Math.random() - 0.5) * 0.5;
              newValue = `${newTemp.toFixed(1)}°C`;
              break;
            case 'moisture':
               let currentMoisture = parseFloat(sensor.value) || 60;
               let newMoisture = Math.max(0, Math.min(100, currentMoisture + (Math.random() - 0.5) * 2));
              newValue = `${newMoisture.toFixed(1)}%`;
              break;
            case 'status':
              if (sensor.name.toLowerCase().includes('pump')) {
                newValue = Math.random() > 0.9 ? (sensor.value === 'Active' ? 'Idle' : 'Active') : sensor.value;
              } else {
                 newValue = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
              }
              break;
          }
          return { ...sensor, status: newStatus, value: newValue };
        });
      });

      // Simulate connection status
      if (Math.random() > 0.98) {
        setIsOnline(prev => !prev);
      } else {
        setIsOnline(true);
      }

    }, 2000);

    return () => clearInterval(interval);
  }, [isLoaded]);

  const sensorToEdit = editingSensorId ? configurableSensors.find(s => s.id === editingSensorId) ?? null : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header isOnline={isOnline} />
      <main className="p-4 sm:p-6 lg:p-8">
        <Dashboard 
            ambientSensorData={ambientSensorData}
            configurableSensors={configurableSensors}
            setConfigurableSensors={setConfigurableSensors}
            placedSensors={placedSensors}
            setPlacedSensors={setPlacedSensors}
            mapImage={mapImage}
            setMapImage={setMapImage}
            onSaveSettings={handleSaveSettings}
            mapZoom={mapZoom}
            setMapZoom={setMapZoom}
            mapPanOffset={mapPanOffset}
            setMapPanOffset={setMapPanOffset}
            onEditSensor={setEditingSensorId}
        />
      </main>
      {sensorToEdit && (
        <SensorEditModal
            sensor={sensorToEdit}
            onClose={() => setEditingSensorId(null)}
            onSave={handleUpdateSensor}
        />
      )}
    </div>
  );
};

export default App;

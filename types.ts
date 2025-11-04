export type FieldStatus = 'ok' | 'alert' | 'danger';

export type SensorType = 'status' | 'temperature' | 'moisture';

// Represents a sensor defined by the user in the configuration panel
export interface ConfigurableSensor {
  id: string;
  name: string;
  type: SensorType;
  status: FieldStatus; // Live status
  value: string;      // Live value string
}

// Represents a sensor that has been placed on the map
export interface PlacedSensor {
  sensorId: string;
  position: { x: number; y: number };
  scale: number; // For resizing the indicator, 1 = 100%
}

// Represents the general, non-configurable sensor readings for the main cards
export interface AmbientSensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  waterTankLevel: number;
}

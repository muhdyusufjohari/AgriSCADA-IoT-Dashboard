import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ConfigurableSensor, PlacedSensor, FieldStatus } from '../types';
import { ZoomInIcon, ZoomOutIcon, ResetZoomIcon } from './icons';

interface SensorIndicatorProps {
  sensor: ConfigurableSensor;
  placedSensor: PlacedSensor;
  isEditing: boolean;
  isInteracting: boolean;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, sensor: PlacedSensor) => void;
  onResizeStart: (e: React.MouseEvent | React.TouchEvent, sensor: PlacedSensor) => void;
  onRemove: () => void;
}

const SensorIndicator: React.FC<SensorIndicatorProps> = ({ sensor, placedSensor, isEditing, isInteracting, onDragStart, onResizeStart, onRemove }) => {
  const statusClasses: { [key in FieldStatus]: { border: string; text: string; } } = {
    ok: { border: 'border-green-500', text: 'text-green-400' },
    alert: { border: 'border-amber-500', text: 'text-amber-400' },
    danger: { border: 'border-red-500', text: 'text-red-400' },
  };

  const handleInteraction = (handler: (e: React.MouseEvent | React.TouchEvent, sensor: PlacedSensor) => void) => (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    handler(e, placedSensor);
  };

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 select-none transition-transform duration-200`}
      style={{ 
        top: `${placedSensor.position.y}%`, 
        left: `${placedSensor.position.x}%`,
        zIndex: isEditing ? (isInteracting ? 30 : 20) : 10,
        transform: `scale(${isInteracting ? 1.05 : 1})`
      }}
    >
      <div 
        className={`bg-slate-900/80 backdrop-blur-sm border-2 ${statusClasses[sensor.status].border} rounded-lg px-3 py-1.5 min-w-[120px] text-center transition-all duration-200 relative ${isEditing ? 'ring-2 ring-white/50 cursor-grab' : ''} ${isInteracting ? 'shadow-2xl' : 'shadow-lg'}`}
        style={{ transform: `scale(${placedSensor.scale})` }}
        onMouseDown={handleInteraction(onDragStart)}
        onTouchStart={handleInteraction(onDragStart)}
      >
        <h4 className="font-bold text-sm text-white truncate" title={sensor.name}>{sensor.name}</h4>
        <p className={`text-xl font-mono font-bold ${statusClasses[sensor.status].text}`}>{sensor.value}</p>
        
        {isEditing && (
          <>
            <button 
              onMouseDown={(e) => { e.stopPropagation(); onRemove(); }}
              onTouchStart={(e) => { e.stopPropagation(); onRemove(); }}
              className="absolute -top-3 -left-3 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-500 cursor-pointer shadow-lg border-2 border-slate-800 z-30 animate-pulse-slow"
              title="Remove from map"
            >X</button>
            <div 
              onMouseDown={handleInteraction(onResizeStart)}
              onTouchStart={handleInteraction(onResizeStart)}
              className="absolute -bottom-3 -right-3 w-6 h-6 bg-blue-600 rounded-full border-2 border-white cursor-nwse-resize shadow-lg z-30 animate-pulse-slow"
              title="Resize"
            ></div>
          </>
        )}
      </div>
    </div>
  );
};

interface FarmMapProps {
  configurableSensors: ConfigurableSensor[];
  placedSensors: PlacedSensor[];
  setPlacedSensors: React.Dispatch<React.SetStateAction<PlacedSensor[]>>;
  mapImage: string | null;
  setMapImage: React.Dispatch<React.SetStateAction<string | null>>;
  onSaveSettings: () => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  panOffset: { x: number; y: number };
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  onEditSensor: (sensorId: string) => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

const FarmMap: React.FC<FarmMapProps> = ({ 
    configurableSensors, 
    placedSensors, 
    setPlacedSensors, 
    mapImage, 
    setMapImage, 
    onSaveSettings,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    onEditSensor,
}) => {
  const [placingSensorId, setPlacingSensorId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftPlacedSensors, setDraftPlacedSensors] = useState<PlacedSensor[]>([]);
  const [activeInteractionId, setActiveInteractionId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const interactionState = useRef<{
    type: 'drag' | 'resize' | 'pan';
    sensorId?: string;
    initialSensor?: PlacedSensor;
    initialCoords: { x: number; y: number };
    initialPan: { x: number; y: number };
    mapRect: DOMRect;
    startTime: number;
    moved: boolean;
  } | null>(null);

  const handleEnterEditMode = () => {
    setDraftPlacedSensors(JSON.parse(JSON.stringify(placedSensors)));
    setIsEditing(true);
  };

  const handleSaveLayout = () => {
    setPlacedSensors(draftPlacedSensors);
    if (window.confirm('Are you sure you want to save the current layout and view? This will overwrite your previous settings.')) {
        onSaveSettings();
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPlacingSensorId(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMapImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing && placingSensorId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x_map = (e.clientX - rect.left - panOffset.x) / zoom;
      const y_map = (e.clientY - rect.top - panOffset.y) / zoom;
      const x_perc = (x_map / rect.width) * 100;
      const y_perc = (y_map / rect.height) * 100;

      const newPlacedSensor = { sensorId: placingSensorId, position: { x: x_perc, y: y_perc }, scale: 1 };
      setDraftPlacedSensors(prev => [...prev, newPlacedSensor]);
      setPlacingSensorId(null);
    }
  };

  const handleInteractionMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!interactionState.current) return;
    
    if (!interactionState.current.moved) {
      interactionState.current.moved = true;
    }
    
    if (e.cancelable) e.preventDefault();

    const isTouchEvent = 'touches' in e;
    const currentCoords = {
        x: isTouchEvent ? e.touches[0].clientX : e.clientX,
        y: isTouchEvent ? e.touches[0].clientY : e.clientY,
    };
    
    const { type, sensorId, initialSensor, initialCoords, initialPan, mapRect } = interactionState.current;
    
    const deltaX = currentCoords.x - initialCoords.x;
    const deltaY = currentCoords.y - initialCoords.y;
    
    if (type === 'pan') {
      const newPanX = initialPan.x + deltaX;
      const newPanY = initialPan.y + deltaY;
      // Clamp panning to keep map in view
      const maxX = 0;
      const maxY = 0;
      const minX = mapRect.width * (1 - zoom);
      const minY = mapRect.height * (1 - zoom);

      setPanOffset({ 
        x: Math.max(minX, Math.min(maxX, newPanX)), 
        y: Math.max(minY, Math.min(maxY, newPanY))
      });
      return;
    }

    setDraftPlacedSensors(prev => prev.map(ps => {
      if (ps.sensorId !== sensorId || !initialSensor) return ps;

      if (type === 'drag') {
        const deltaX_unzoomed = deltaX / zoom;
        const deltaY_unzoomed = deltaY / zoom;
        const newX = initialSensor.position.x + (deltaX_unzoomed / mapRect.width) * 100;
        const newY = initialSensor.position.y + (deltaY_unzoomed / mapRect.height) * 100;
        return {
          ...ps,
          position: {
            x: Math.max(0, Math.min(100, newX)),
            y: Math.max(0, Math.min(100, newY)),
          },
        };
      } else { // resize
        const movement = deltaX + deltaY;
        const newScale = initialSensor.scale + (movement / 200);
        return {
          ...ps,
          scale: Math.max(0.5, Math.min(3, newScale))
        };
      }
    }));
  }, [zoom, setPanOffset]);

  const handleInteractionEnd = useCallback(() => {
    if (interactionState.current) {
      const { type, sensorId, startTime, moved } = interactionState.current;
      const duration = Date.now() - startTime;
      
      // Treat as a click if it was a drag attempt that didn't move and was short.
      if (type === 'drag' && !moved && duration < 300 && sensorId) {
        onEditSensor(sensorId);
      }

      if (interactionState.current.type === 'pan') {
        mapContainerRef.current!.style.cursor = 'grab';
      }
    }

    setActiveInteractionId(null);
    document.body.style.cursor = '';
    interactionState.current = null;
    window.removeEventListener('mousemove', handleInteractionMove);
    window.removeEventListener('mouseup', handleInteractionEnd);
    window.removeEventListener('touchmove', handleInteractionMove);
    window.removeEventListener('touchend', handleInteractionEnd);
  }, [handleInteractionMove, onEditSensor]);
  
  const startSensorInteraction = (type: 'drag' | 'resize', e: React.MouseEvent | React.TouchEvent, sensor: PlacedSensor) => {
    if (!mapContainerRef.current) return;
    if ('button' in e && e.button !== 0) return;
    setActiveInteractionId(sensor.sensorId);
    
    const isTouchEvent = 'touches' in e;
    const initialCoords = {
        x: isTouchEvent ? e.touches[0].clientX : e.clientX,
        y: isTouchEvent ? e.touches[0].clientY : e.clientY,
    };

    if (!isTouchEvent) {
        document.body.style.cursor = type === 'drag' ? 'grabbing' : 'nwse-resize';
    }

    interactionState.current = {
      type,
      sensorId: sensor.sensorId,
      initialSensor: JSON.parse(JSON.stringify(sensor)),
      initialCoords,
      initialPan: panOffset,
      mapRect: mapContainerRef.current.getBoundingClientRect(),
      startTime: Date.now(),
      moved: false,
    };

    window.addEventListener('mousemove', handleInteractionMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchmove', handleInteractionMove, { passive: false });
    window.addEventListener('touchend', handleInteractionEnd);
  };
  
  const startPanInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (isEditing) return;
    if (!mapContainerRef.current) return;
    if ('button' in e && e.button !== 0) return;

    mapContainerRef.current.style.cursor = 'grabbing';
    
    const isTouchEvent = 'touches' in e;
    const initialCoords = {
      x: isTouchEvent ? e.touches[0].clientX : e.clientX,
      y: isTouchEvent ? e.touches[0].clientY : e.clientY,
    };

    interactionState.current = {
      type: 'pan',
      initialCoords,
      initialPan: panOffset,
      mapRect: mapContainerRef.current.getBoundingClientRect(),
      startTime: Date.now(),
      moved: false,
    };
    
    window.addEventListener('mousemove', handleInteractionMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchmove', handleInteractionMove, { passive: false });
    window.addEventListener('touchend', handleInteractionEnd);
  }

  const handleZoom = (delta: number) => {
    setZoom(prevZoom => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom + delta));
      // Adjust pan to keep center point the same (basic implementation)
      // A more advanced version would zoom towards the cursor
      if (newZoom <= 1) {
          setPanOffset({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleResetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };


  const unplacedSensors = configurableSensors.filter(
    sensor => !(isEditing ? draftPlacedSensors : placedSensors).some(ps => ps.sensorId === sensor.id)
  );
  
  const sensorsToDisplay = isEditing ? draftPlacedSensors : placedSensors;
  
  const handleRemoveFromMap = (sensorId: string) => {
    setDraftPlacedSensors(prev => prev.filter(ps => ps.sensorId !== sensorId));
  };

  return (
    <div className="flex-grow flex flex-col h-full">
      <div
        ref={mapContainerRef}
        className={`relative flex-grow bg-slate-900/70 rounded-lg overflow-hidden bg-cover bg-center transition-all duration-300 w-full ${placingSensorId && isEditing ? 'cursor-crosshair' : ''} ${!isEditing && zoom > 1 ? 'cursor-grab' : ''} ${isEditing ? 'ring-2 ring-brand-amber ring-offset-4 ring-offset-slate-800' : ''}`}
        onMouseDown={startPanInteraction}
        onTouchStart={startPanInteraction}
      >
        <div 
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: mapImage ? `url(${mapImage})` : `radial-gradient(circle, #1e293b 0%, #0f172a 100%)`,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transition: 'transform 0.1s ease-out',
            transformOrigin: 'top left',
          }}
          onClick={handleMapClick}
        >
          {sensorsToDisplay.map(placedSensor => {
            const sensor = configurableSensors.find(s => s.id === placedSensor.sensorId);
            if (!sensor) return null;
            return (
              <SensorIndicator
                key={sensor.id}
                sensor={sensor}
                placedSensor={placedSensor}
                isEditing={isEditing}
                isInteracting={activeInteractionId === placedSensor.sensorId}
                onDragStart={startSensorInteraction.bind(null, 'drag')}
                onResizeStart={startSensorInteraction.bind(null, 'resize')}
                onRemove={() => handleRemoveFromMap(sensor.id)}
              />
            );
          })}
        </div>

        {isEditing && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-500/90 text-slate-900 font-bold px-4 py-1 rounded-b-lg z-30 text-sm animate-pulse">
            EDITING LAYOUT
          </div>
        )}
        {!mapImage && !placingSensorId && !isEditing && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">
            <p>Upload a map image or enter Edit Mode to place sensors</p>
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
            <button onClick={() => handleZoom(0.25)} className="w-10 h-10 bg-slate-900/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-colors disabled:opacity-50" title="Zoom In" disabled={zoom >= MAX_ZOOM}><ZoomInIcon /></button>
            <button onClick={() => handleZoom(-0.25)} className="w-10 h-10 bg-slate-900/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-colors disabled:opacity-50" title="Zoom Out" disabled={zoom <= MIN_ZOOM}><ZoomOutIcon /></button>
            <button onClick={handleResetView} className="w-10 h-10 bg-slate-900/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-colors disabled:opacity-50" title="Reset View" disabled={zoom === 1 && panOffset.x === 0 && panOffset.y === 0}><ResetZoomIcon /></button>
        </div>
      </div>

      <div className="pt-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <input type="file" accept="image/png, image/jpeg, image/svg+xml" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors" disabled={isEditing}>
            {mapImage ? 'Change Map' : 'Upload Map'}
          </button>
          {mapImage && (
            <button 
              onClick={() => setMapImage(null)} 
              className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
              disabled={isEditing}
            >
              Remove
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {isEditing ? (
            <>
              <span className="text-sm text-slate-400">Place Sensor:</span>
              <select 
                value={placingSensorId || ""}
                onChange={(e) => setPlacingSensorId(e.target.value || null)}
                className="bg-slate-700 text-white py-2 px-3 rounded-lg text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
              >
                <option value="">{unplacedSensors.length > 0 ? 'Select sensor...' : 'All placed'}</option>
                {unplacedSensors.map(sensor => (
                  <option key={sensor.id} value={sensor.id}>{sensor.name}</option>
                ))}
              </select>
              <button onClick={handleSaveLayout} className="bg-brand-green hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">Save Layout</button>
              <button onClick={handleCancelEdit} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">Cancel</button>
            </>
          ) : (
              <button onClick={handleEnterEditMode} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">Edit Layout</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmMap;

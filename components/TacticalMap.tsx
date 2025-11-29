import React, { useMemo } from 'react';
import { Incident, Responder, Severity } from '../types';
import { BOUNDS } from '../constants';
import { normalizeCoordinate } from '../utils/geo';
import { MapPin, Navigation, AlertTriangle, Activity } from 'lucide-react';
import clsx from 'clsx';

interface TacticalMapProps {
  incidents: Incident[];
  responders: Responder[];
  onIncidentClick: (incident: Incident) => void;
  selectedIncidentId: string | null;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({ 
  incidents, 
  responders, 
  onIncidentClick, 
  selectedIncidentId 
}) => {
  
  // Render loop
  const renderedIncidents = useMemo(() => {
    return incidents.map(inc => {
      // Calculate % position
      const x = normalizeCoordinate(inc.gps_lng, BOUNDS.minLng, BOUNDS.maxLng);
      // Invert Y because SVG 0 is top
      const y = 100 - normalizeCoordinate(inc.gps_lat, BOUNDS.minLat, BOUNDS.maxLat);

      const colorClass = 
        inc.severity === Severity.High ? 'text-red-500 fill-red-500/20' :
        inc.severity === Severity.Medium ? 'text-orange-500 fill-orange-500/20' :
        'text-yellow-400 fill-yellow-400/20';

      const isSelected = selectedIncidentId === inc.incident_id;

      return (
        <div
          key={inc.incident_id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-125 hover:z-50"
          style={{ left: `${x}%`, top: `${y}%`, zIndex: isSelected ? 40 : 10 }}
          onClick={() => onIncidentClick(inc)}
        >
          {/* Ping Effect for High Severity or New */}
          {(inc.severity === Severity.High || inc.is_new_alert) && (
            <div className="absolute inset-0 rounded-full animate-ping opacity-75 bg-red-500 h-full w-full"></div>
          )}
          
          <div className={clsx("relative p-1 rounded-full border-2 bg-gray-900 shadow-lg", 
            isSelected ? "border-white scale-110" : "border-transparent"
          )}>
            <MapPin className={clsx("w-6 h-6", colorClass)} />
          </div>

          {/* Tooltip on hover or selection */}
          <div className={clsx(
            "absolute top-8 left-1/2 -translate-x-1/2 bg-gray-900/90 border border-gray-700 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity z-50",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
             <span className="font-bold">{inc.incident_id}</span>
             <div className="text-[10px] text-gray-400">{inc.severity}</div>
          </div>
        </div>
      );
    });
  }, [incidents, selectedIncidentId, onIncidentClick]);

  const renderedResponders = useMemo(() => {
    return responders.map(res => {
       const x = normalizeCoordinate(res.last_lng, BOUNDS.minLng, BOUNDS.maxLng);
       const y = 100 - normalizeCoordinate(res.last_lat, BOUNDS.minLat, BOUNDS.maxLat);
       
       return (
        <div
          key={res.responder_id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out"
          style={{ left: `${x}%`, top: `${y}%`, zIndex: 5 }}
        >
          <div className="text-emerald-400">
            <Navigation className="w-5 h-5 fill-emerald-500/30 transform rotate-45" />
          </div>
        </div>
       )
    });
  }, [responders]);

  return (
    <div className="w-full h-full relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group select-none">
      {/* Map Background / Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {/* Grid Lines */}
        <div className="w-full h-full" 
             style={{ 
               backgroundImage: `linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)`, 
               backgroundSize: '10% 10%' 
             }}>
        </div>
      </div>
      
      {/* City/Terrain features (Abstract) */}
      <div className="absolute top-[20%] left-[30%] w-[15%] h-[40%] bg-gray-800/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[20%] bg-blue-900/10 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute top-[40%] right-[10%] w-0.5 h-[30%] bg-gray-700/50 pointer-events-none rotate-12"></div>
      
      {/* Map Overlay Info */}
      <div className="absolute top-4 right-4 bg-gray-950/80 backdrop-blur border border-gray-700 p-2 rounded text-xs text-gray-400 font-mono z-10">
        <div className="flex items-center gap-2"><Activity className="w-3 h-3 text-red-500" /> LIVE MONITORING</div>
        <div>LAT: 20.34 - 20.37</div>
        <div>LNG: 85.80 - 85.83</div>
      </div>

      {/* Render Layers */}
      <div className="absolute inset-0 w-full h-full">
        {renderedResponders}
        {renderedIncidents}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-950/80 backdrop-blur p-2 rounded border border-gray-800 text-[10px] flex flex-col gap-1 z-10">
         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> High Severity</div>
         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Medium</div>
         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Low</div>
         <div className="flex items-center gap-2"><Navigation className="w-3 h-3 text-emerald-400" /> Responder</div>
      </div>
    </div>
  );
};
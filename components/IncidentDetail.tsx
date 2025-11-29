import React, { useMemo } from 'react';
import { Incident, IncidentStatus, Responder, ResponderSuggestion, Severity } from '../types';
import { calculateDistanceKm } from '../utils/geo';
import { X, Radio, Shield, User, Activity, Navigation, MessageSquare, Phone, AlertOctagon } from 'lucide-react';
import clsx from 'clsx';

interface IncidentDetailProps {
  incident: Incident;
  onClose: () => void;
  onUpdateStatus: (id: string, status: IncidentStatus, updates?: Partial<Incident>) => void;
  availableResponders: Responder[];
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ incident, onClose, onUpdateStatus, availableResponders }) => {

  // Suggest Responders
  const suggestions: ResponderSuggestion[] = useMemo(() => {
    if (incident.assigned_responder) return [];
    
    return availableResponders
      .filter(r => r.status === 'Available')
      .map(r => {
        const dist = calculateDistanceKm(incident.gps_lat, incident.gps_lng, r.last_lat, r.last_lng);
        // Assume 60km/h average speed
        const time = Math.ceil((dist / 60) * 60); 
        return { ...r, distance_km: dist, est_time_min: time };
      })
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 3);
  }, [incident, availableResponders]);

  const handleDispatch = (responder: ResponderSuggestion) => {
    onUpdateStatus(incident.incident_id, IncidentStatus.Dispatched, {
      assigned_responder: responder.responder_id,
      responder_eta_min: responder.est_time_min,
      ambulance_id: responder.vehicle_id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-850">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">Incident #{incident.incident_id}</h2>
              <span className={clsx(
                "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider",
                incident.severity === Severity.High ? "bg-red-500 text-white" :
                incident.severity === Severity.Medium ? "bg-orange-500 text-white" : "bg-yellow-500 text-black"
              )}>
                {incident.severity} Priority
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
              <ClockIcon /> {new Date(incident.timestamp_utc).toLocaleString()} via <span className="text-blue-400">{incident.sent_via}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Col: Sensor Data & Context */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Bar */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              {[IncidentStatus.New, IncidentStatus.Acknowledged, IncidentStatus.Dispatched, IncidentStatus.Resolved].map((step, idx) => {
                const isActive = step === incident.status;
                const isPast = [IncidentStatus.New, IncidentStatus.Acknowledged, IncidentStatus.Dispatched, IncidentStatus.Resolved].indexOf(incident.status) >= idx;
                return (
                  <div key={step} className={clsx("p-2 rounded border", 
                    isActive ? "bg-blue-600 border-blue-500 text-white" : 
                    isPast ? "bg-blue-900/20 border-blue-900 text-blue-400" : "bg-gray-800 border-gray-700 text-gray-500"
                  )}>
                    {step}
                  </div>
                );
              })}
            </div>

            {/* Main Info Card */}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" /> Sensor Telemetry
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <DataCard label="Max Speed" value={`${incident.speed_kmh} km/h`} highlight={incident.speed_kmh > 80} />
                <DataCard label="Peak G-Force" value={`${incident.accel_peak_g}g`} highlight={incident.accel_peak_g > 30} />
                <DataCard label="Rotation" value={`${incident.gyro_peak_dps} deg/s`} />
                <DataCard label="Source ID" value={incident.sensor_source} />
                <DataCard label="Report Type" value={incident.report_type} />
                <DataCard label="Coords" value={`${incident.gps_lat.toFixed(4)}, ${incident.gps_lng.toFixed(4)}`} />
              </div>
            </div>

             {/* Victim Info (Mocked) */}
             <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
               <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3 flex items-center gap-2">
                 <User className="w-4 h-4 text-emerald-400" /> Patient Information
               </h3>
               {incident.victim_name ? (
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-400">
                     {incident.victim_name.charAt(0)}
                   </div>
                   <div>
                     <div className="text-lg font-bold text-white">{incident.victim_name}</div>
                     <div className="text-sm text-gray-400">Age: {incident.victim_age} • Est. Condition: Unknown</div>
                   </div>
                   <div className="ml-auto flex gap-2">
                     <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Vitals
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="text-gray-500 text-sm italic">No victim data transmitted from vehicle hub.</div>
               )}
             </div>
            
             <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
               <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3">Notes / Log</h3>
               <p className="text-gray-300 text-sm">{incident.notes}</p>
             </div>

          </div>

          {/* Right Col: Actions & Dispatch */}
          <div className="space-y-4">
            
            {/* Actions */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col gap-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Quick Actions</h3>
              
              {incident.status === IncidentStatus.New && (
                <button 
                  onClick={() => onUpdateStatus(incident.incident_id, IncidentStatus.Acknowledged)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex justify-center items-center gap-2 transition-colors"
                >
                  <Radio className="w-4 h-4" /> Acknowledge Alert
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                 <button className="py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm flex justify-center items-center gap-2">
                    <Phone className="w-3 h-3" /> Call Driver
                 </button>
                 <button className="py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm flex justify-center items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> SMS
                 </button>
              </div>

              {incident.status !== IncidentStatus.Resolved && (
                <button 
                  onClick={() => onUpdateStatus(incident.incident_id, IncidentStatus.Resolved)}
                  className="w-full py-2 mt-2 bg-gray-800 hover:bg-green-900 border border-gray-600 text-gray-300 hover:text-green-400 rounded font-medium text-sm transition-colors"
                >
                  Mark Resolved
                </button>
              )}
            </div>

            {/* Dispatch Module */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 min-h-[300px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center justify-between">
                <span>Dispatch Resource</span>
                {incident.status === IncidentStatus.Dispatched && <span className="text-emerald-400">Active</span>}
              </h3>

              {incident.status === IncidentStatus.Dispatched ? (
                <div className="bg-emerald-900/20 border border-emerald-900 rounded p-4 text-center">
                  <div className="text-emerald-400 font-bold text-lg mb-1">{incident.assigned_responder}</div>
                  <div className="text-sm text-gray-400">ETA: {incident.responder_eta_min} mins</div>
                  <div className="text-xs text-gray-500 mt-2">Vehicle: {incident.ambulance_id}</div>
                  <button className="mt-4 text-xs text-red-400 hover:underline">Reassign / Cancel</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 mb-2">Nearest available units:</div>
                  {suggestions.length > 0 ? (
                    suggestions.map(s => (
                      <div key={s.responder_id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded hover:bg-gray-700 transition-colors border border-gray-600/50">
                        <div>
                           <div className="font-bold text-sm text-white">{s.name}</div>
                           <div className="text-xs text-gray-400">{s.distance_km}km • {s.est_time_min} min</div>
                        </div>
                        <button 
                          onClick={() => handleDispatch(s)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
                        >
                          Dispatch
                        </button>
                      </div>
                    ))
                  ) : (
                     <div className="text-sm text-gray-500 text-center py-4">No available units nearby.</div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
const ClockIcon = () => <Clock className="w-3 h-3" />;
import { Clock } from 'lucide-react';

const DataCard = ({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) => (
  <div className={clsx("p-2 rounded bg-gray-900 border", highlight ? "border-red-900/50 bg-red-900/10" : "border-gray-800")}>
    <div className="text-[10px] text-gray-500 uppercase">{label}</div>
    <div className={clsx("font-mono font-medium", highlight ? "text-red-400" : "text-gray-200")}>{value}</div>
  </div>
);
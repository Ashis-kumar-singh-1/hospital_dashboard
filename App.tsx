import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { TacticalMap } from './components/TacticalMap';
import { IncidentFeed } from './components/IncidentFeed';
import { IncidentDetail } from './components/IncidentDetail';
import { AnalyticsView } from './components/Charts';
import { INITIAL_INCIDENTS, INITIAL_RESPONDERS } from './constants';
import { Incident, Responder, ViewState, IncidentStatus, Severity } from './types';
import { generateRandomIncident } from './utils/simulator';
import { Bell, ShieldAlert, Activity, Users } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [view, setView] = useState<ViewState>('overview');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [responders, setResponders] = useState<Responder[]>(INITIAL_RESPONDERS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);
  const [lastAlertTime, setLastAlertTime] = useState<number>(0);

  // Simulation Interval
  useEffect(() => {
    let interval: any;
    if (isSimulationActive) {
      interval = setInterval(() => {
        // 30% chance to add incident every 3 seconds to keep demo lively
        if (Math.random() > 0.7) {
            const newIncident = generateRandomIncident(1);
            setIncidents(prev => [newIncident, ...prev]);
            
            // Audio visualizer cue
            if (newIncident.severity === Severity.High) {
              setLastAlertTime(Date.now());
            }
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSimulationActive]);

  // Escalation Logic (Mock)
  useEffect(() => {
    const interval = setInterval(() => {
       const now = Date.now();
       setIncidents(prev => prev.map(inc => {
         // Auto escalate if High & New for > 60s
         const age = now - new Date(inc.timestamp_utc).getTime();
         if (inc.status === IncidentStatus.New && inc.severity === Severity.High && age > 60000) {
            // In real app, trigger alert here
         }
         // Clear "new" flash after 10s
         if (inc.is_new_alert && age > 10000) {
            return { ...inc, is_new_alert: false };
         }
         return inc;
       }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleIncidentSelect = (incident: Incident) => {
    setSelectedIncidentId(incident.incident_id);
    // Mark read
    if (incident.is_new_alert) {
        setIncidents(prev => prev.map(i => i.incident_id === incident.incident_id ? { ...i, is_new_alert: false } : i));
    }
  };

  const handleUpdateStatus = (id: string, status: IncidentStatus, updates?: Partial<Incident>) => {
    setIncidents(prev => prev.map(i => 
      i.incident_id === id ? { ...i, status, ...updates } : i
    ));
    
    // If resource assigned, update responder status
    if (updates?.assigned_responder) {
       setResponders(prev => prev.map(r => 
         r.responder_id === updates.assigned_responder ? { ...r, status: 'En route' } : r
       ));
    }
  };

  const selectedIncident = incidents.find(i => i.incident_id === selectedIncidentId);
  const activeHighSev = incidents.filter(i => i.status !== IncidentStatus.Resolved && i.severity === Severity.High).length;

  return (
    <Layout 
      currentView={view} 
      onChangeView={setView} 
      isSimulationActive={isSimulationActive}
      onToggleSimulation={() => setIsSimulationActive(!isSimulationActive)}
      activeIncidentCount={activeHighSev}
    >
      
      {/* Alert Overlay */}
      {Date.now() - lastAlertTime < 2000 && (
        <div className="absolute top-0 inset-x-0 h-1 bg-red-500 z-50 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
      )}

      {view === 'overview' && (
        <div className="flex h-full">
           {/* Left: Feed */}
           <div className="w-1/3 min-w-[350px] max-w-[450px] h-full p-4 flex flex-col gap-4 bg-gray-950/50">
             
             {/* KPI Stats */}
             <div className="grid grid-cols-2 gap-3">
               <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg flex flex-col">
                 <span className="text-[10px] text-gray-500 uppercase font-bold">Avg Response</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-xl font-mono text-emerald-400 font-bold">8.2</span>
                   <span className="text-xs text-gray-400">min</span>
                 </div>
               </div>
               <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg flex flex-col">
                 <span className="text-[10px] text-gray-500 uppercase font-bold">Units Avail</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-xl font-mono text-blue-400 font-bold">{responders.filter(r => r.status === 'Available').length}</span>
                   <span className="text-xs text-gray-400">/ {responders.length}</span>
                 </div>
               </div>
             </div>

             {/* Feed */}
             <div className="flex-1 overflow-hidden">
               <IncidentFeed 
                 incidents={incidents} 
                 onSelect={handleIncidentSelect} 
                 selectedId={selectedIncidentId} 
               />
             </div>
           </div>

           {/* Right: Map */}
           <div className="flex-1 h-full p-4 relative">
             <TacticalMap 
               incidents={incidents} 
               responders={responders} 
               onIncidentClick={handleIncidentSelect}
               selectedIncidentId={selectedIncidentId}
             />
             
             {/* Map Controls (Floating) */}
             <div className="absolute bottom-8 right-8 flex gap-2">
               <button onClick={() => setIncidents([generateRandomIncident(1), ...incidents])} className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded shadow-lg border border-gray-700 text-xs">
                 + Manual Test
               </button>
             </div>
           </div>
        </div>
      )}

      {view === 'analytics' && (
        <AnalyticsView incidents={incidents} />
      )}

      {view === 'resources' && (
         <div className="p-8">
           <h2 className="text-2xl font-bold text-white mb-6">Active Resources</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {responders.map(r => (
               <div key={r.responder_id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                 <div className={clsx("w-3 h-3 rounded-full", r.status === 'Available' ? "bg-emerald-500" : "bg-orange-500")}></div>
                 <div>
                   <div className="font-bold text-gray-200">{r.name}</div>
                   <div className="text-xs text-gray-400">{r.vehicle_id} • {r.status}</div>
                 </div>
                 <div className="ml-auto text-xs text-gray-500 font-mono">Bat: {r.battery_pct}%</div>
               </div>
             ))}
           </div>
         </div>
      )}
       
       {view === 'settings' && (
         <div className="p-8 max-w-2xl">
           <h2 className="text-2xl font-bold text-white mb-6">System Configuration</h2>
           <div className="space-y-6">
             <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="font-bold text-gray-300 mb-4">Integrations</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">SMS Gateway (Twilio/Local)</span>
                      <div className="w-10 h-5 bg-green-900 rounded-full relative cursor-pointer"><div className="w-5 h-5 bg-green-500 rounded-full absolute right-0"></div></div>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">LoRaWAN Relay</span>
                      <div className="w-10 h-5 bg-green-900 rounded-full relative cursor-pointer"><div className="w-5 h-5 bg-green-500 rounded-full absolute right-0"></div></div>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Supabase Sync</span>
                      <div className="w-10 h-5 bg-gray-700 rounded-full relative cursor-pointer"><div className="w-5 h-5 bg-gray-400 rounded-full absolute left-0"></div></div>
                   </div>
                </div>
             </div>
             <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="font-bold text-gray-300 mb-4">Alert Thresholds</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Auto-Escalate Delay (High Severity)</label>
                    <input type="range" className="w-full" />
                    <div className="text-right text-xs text-gray-400">60 seconds</div>
                  </div>
                </div>
             </div>
           </div>
         </div>
       )}

      {/* Detail Modal */}
      {selectedIncident && (
        <IncidentDetail 
          incident={selectedIncident} 
          onClose={() => setSelectedIncidentId(null)} 
          onUpdateStatus={handleUpdateStatus}
          availableResponders={responders}
        />
      )}
    </Layout>
  );
}

export default App;
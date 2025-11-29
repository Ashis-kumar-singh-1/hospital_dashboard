import React from 'react';
import { Incident, IncidentStatus, Severity } from '../types';
import { AlertTriangle, Clock, CheckCircle, Truck, XOctagon } from 'lucide-react';
import clsx from 'clsx';

interface IncidentFeedProps {
  incidents: Incident[];
  onSelect: (incident: Incident) => void;
  selectedId: string | null;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({ incidents, onSelect, selectedId }) => {
  
  const getStatusIcon = (status: IncidentStatus) => {
    switch(status) {
      case IncidentStatus.New: return <AlertTriangle className="w-4 h-4" />;
      case IncidentStatus.Acknowledged: return <CheckCircle className="w-4 h-4" />;
      case IncidentStatus.Dispatched: return <Truck className="w-4 h-4" />;
      case IncidentStatus.Resolved: return <XOctagon className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch(severity) {
      case Severity.High: return 'text-red-500 border-l-4 border-red-500 bg-red-500/5';
      case Severity.Medium: return 'text-orange-500 border-l-4 border-orange-500 bg-orange-500/5';
      case Severity.Low: return 'text-yellow-500 border-l-4 border-yellow-500 bg-yellow-500/5';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-850">
        <h3 className="font-semibold text-gray-200">Incident Feed</h3>
        <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">{incidents.length} Active</span>
      </div>
      
      <div className="overflow-y-auto flex-1 p-2 space-y-2">
        {incidents.length === 0 ? (
          <div className="text-center text-gray-500 py-10 text-sm">No incidents found</div>
        ) : (
          incidents.map((incident) => {
            const timeAgo = Math.floor((Date.now() - new Date(incident.timestamp_utc).getTime()) / 60000);
            const isSelected = selectedId === incident.incident_id;

            return (
              <div 
                key={incident.incident_id}
                onClick={() => onSelect(incident)}
                className={clsx(
                  "relative p-3 rounded-lg cursor-pointer transition-all border border-transparent hover:bg-gray-800",
                  getSeverityColor(incident.severity),
                  isSelected ? "bg-gray-800 ring-1 ring-blue-500" : "bg-gray-900",
                  incident.is_new_alert && "animate-pulse"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tracking-tight">{incident.incident_id}</span>
                    {incident.is_new_alert && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"/>}
                  </div>
                  <div className="flex items-center text-xs text-gray-400 gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo}m ago</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-300 truncate font-medium mb-2">
                  {incident.notes}
                </div>

                <div className="flex justify-between items-center mt-2">
                   <div className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                     {incident.sent_via}
                   </div>
                   <div className={clsx("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
                      incident.status === IncidentStatus.New ? "bg-red-900/40 text-red-200" :
                      incident.status === IncidentStatus.Resolved ? "bg-gray-700 text-gray-300" :
                      "bg-blue-900/30 text-blue-200"
                   )}>
                      {getStatusIcon(incident.status)}
                      <span>{incident.status}</span>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
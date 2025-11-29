import React from 'react';
import { Incident, IncidentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie } from 'recharts';

interface AnalyticsProps {
  incidents: Incident[];
}

export const AnalyticsView: React.FC<AnalyticsProps> = ({ incidents }) => {
  
  // Prepare Data for Charts
  const severityData = [
    { name: 'High', value: incidents.filter(i => i.severity === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: incidents.filter(i => i.severity === 'Medium').length, color: '#f97316' },
    { name: 'Low', value: incidents.filter(i => i.severity === 'Low').length, color: '#eab308' },
  ];

  const statusData = [
    { name: 'New', value: incidents.filter(i => i.status === 'New').length, color: '#ef4444' },
    { name: 'Ack', value: incidents.filter(i => i.status === 'Acknowledged').length, color: '#3b82f6' },
    { name: 'Disp', value: incidents.filter(i => i.status === 'Dispatched').length, color: '#10b981' },
    { name: 'Done', value: incidents.filter(i => i.status === 'Resolved').length, color: '#6b7280' },
  ];

  // Mock timeline data based on current incidents + random history
  const timelineData = incidents.slice(0, 10).map((inc, i) => ({
    time: i,
    gForce: inc.accel_peak_g,
    speed: inc.speed_kmh
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-2 rounded shadow-xl text-xs">
          <p className="font-bold text-gray-200">{label}</p>
          <p className="text-blue-400">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-950">
      <h2 className="text-2xl font-bold mb-6 text-white">Analytics & Historical Data</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Severity Distribution */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 h-64">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pipeline */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 h-64">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Incident Status Pipeline</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <XAxis dataKey="name" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: '#1f2937'}} content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sensor correlation */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 h-80">
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Recent Sensor Peaks (G-Force vs Speed)</h3>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <XAxis dataKey="time" hide />
              <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{stroke: '#4b5563', strokeWidth: 1}} />
              <Line type="monotone" dataKey="gForce" stroke="#ef4444" strokeWidth={2} dot={{r: 4, fill: '#ef4444'}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-2 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-red-500"></div> G-Force</div>
          <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-blue-500"></div> Speed (km/h)</div>
        </div>
      </div>
    </div>
  );
};
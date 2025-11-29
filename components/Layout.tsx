import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Users, BarChart3, Settings, AlertOctagon, Siren } from 'lucide-react';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isSimulationActive: boolean;
  onToggleSimulation: () => void;
  activeIncidentCount: number;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, currentView, onChangeView, isSimulationActive, onToggleSimulation, activeIncidentCount 
}) => {
  
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => onChangeView(view)}
      className={clsx(
        "flex flex-col items-center justify-center py-4 w-full border-l-2 transition-colors",
        currentView === view 
          ? "border-blue-500 bg-gray-800 text-blue-400" 
          : "border-transparent text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
      )}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-20 bg-gray-900 border-r border-gray-800 flex flex-col items-center z-20">
        <div className="h-16 flex items-center justify-center w-full border-b border-gray-800 bg-blue-900/10">
          <Siren className="w-8 h-8 text-blue-500" />
        </div>
        
        <nav className="flex-1 w-full flex flex-col gap-2 mt-4">
          <NavItem view="overview" icon={LayoutDashboard} label="Live" />
          <NavItem view="resources" icon={Users} label="Units" />
          <NavItem view="analytics" icon={BarChart3} label="Data" />
        </nav>

        <div className="w-full pb-4 flex flex-col items-center gap-4">
          <button 
             onClick={onToggleSimulation}
             className={clsx("w-3 h-3 rounded-full shadow-lg transition-all", isSimulationActive ? "bg-green-500 shadow-green-500/50 animate-pulse" : "bg-red-900")} 
             title={isSimulationActive ? "Simulation Active" : "Simulation Paused"}
          />
          <NavItem view="settings" icon={Settings} label="Config" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex justify-between items-center px-6 z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              RoadRescue <span className="text-blue-500 font-light">ResponseHub</span>
            </h1>
            <p className="text-xs text-gray-500">Emergency Operations Center • Alpha Unit</p>
          </div>

          <div className="flex items-center gap-4">
            {activeIncidentCount > 0 && (
               <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-full flex items-center gap-2 animate-pulse">
                 <AlertOctagon className="w-4 h-4" />
                 {activeIncidentCount} CRITICAL INCIDENTS
               </div>
            )}
            <div className="text-right">
              <div className="text-sm font-bold text-gray-200">{new Date().toLocaleTimeString()}</div>
              <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
              <span className="font-bold text-sm text-gray-400">OP</span>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
};
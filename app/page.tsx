'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';
import { useSocket } from '@/hooks/useSocket';

const AttackMap = dynamic(() => import('@/components/AttackMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export default function Home() {
  const { attacks, stats, isConnected } = useSocket();
  const [showDashboard, setShowDashboard] = React.useState(true);

  React.useEffect(() => {
    console.log('[v0] App rendered - isConnected:', isConnected, 'attacks count:', attacks.length);
  }, [isConnected, attacks.length]);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      {/* Main Map */}
      <div className="absolute inset-0 w-full h-full">
        <AttackMap attacks={attacks} />
      </div>

      {/* Attack Intensity Legend */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="threat-panel rounded-lg px-6 py-4 border border-purple-500/20 bg-black/40 backdrop-blur-sm">
          <h3 className="text-xs font-bold text-purple-300 mb-3 text-center uppercase tracking-wider">
            Threat Levels
          </h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full bg-red-400 shadow-lg"
                style={{ boxShadow: '0 0 8px #ef4444' }}
              />
              <span className="text-xs text-white font-medium">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full bg-yellow-400 shadow-lg"
                style={{ boxShadow: '0 0 8px #f59e0b' }}
              />
              <span className="text-xs text-white font-medium">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full bg-green-400 shadow-lg"
                style={{ boxShadow: '0 0 8px #10b981' }}
              />
              <span className="text-xs text-white font-medium">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full bg-blue-500 shadow-lg"
                style={{ boxShadow: '0 0 8px #3b82f6' }}
              />
              <span className="text-xs text-white font-medium">Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Overlay */}
      {showDashboard && (
        <Dashboard attacks={attacks} stats={stats} isConnected={isConnected} />
      )}

      {/* Loading overlay when not connected */}
      {!isConnected && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="threat-panel rounded-xl p-8 text-center max-w-md border border-purple-500/20 bg-black/60">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 border-r-pink-400 mx-auto" />
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-400/20 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-4">
              Initializing Threat Intelligence
            </h2>
            <p className="text-gray-300 mb-4 text-sm">
              Establishing secure connection to global threat feeds...
            </p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              />
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toggle Dashboard Button */}
      <button
        onClick={() => setShowDashboard(!showDashboard)}
        className="absolute top-6 right-6 z-30 threat-panel rounded-lg px-4 py-2 border border-purple-500/20 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
        title={showDashboard ? 'Hide dashboard' : 'Show dashboard'}
      >
        <span className="text-xs text-purple-300 font-bold uppercase tracking-wide flex items-center gap-2">
          {showDashboard ? '⊘' : '⊚'} Dashboard
        </span>
      </button>

      {/* Status indicator */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="threat-panel rounded-lg px-4 py-2 border border-purple-500/20 bg-black/40 backdrop-blur-sm">
          <p className="text-xs text-gray-400 flex items-center">
            <span
              className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}
            />
            {isConnected ? 'Connected' : 'Connecting'} • {attacks.length} active threats
          </p>
        </div>
      </div>

      {/* Debug info - remove once working */}
      <div className="absolute top-6 right-6 z-20 max-w-xs">
        <div className="bg-black/80 border border-gray-700 rounded-lg p-3 text-xs font-mono text-gray-400 space-y-1">
          <div>STATUS: {isConnected ? '✓ CONNECTED' : '✗ CONNECTING'}</div>
          <div>ATTACKS: {attacks.length}</div>
          <div>
            STATS: {Object.keys(stats.mostTargetedCountries).length} countries
          </div>
          <div className="text-gray-500 mt-2 text-[10px]">
            Check browser console for detailed logs [v0]
          </div>
        </div>
      </div>
    </div>
  );
};


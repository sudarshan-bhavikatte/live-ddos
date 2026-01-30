'use client';

import React, { useMemo } from 'react';
import type { Attack, AttackStats } from '@/types/attack';

interface DashboardProps {
    attacks: Attack[];
    stats: AttackStats;
    isConnected: boolean;
}

export default function Dashboard({ attacks, stats, isConnected }: DashboardProps) {
    React.useEffect(() => {
        console.log('[v0] Dashboard mounted - attacks:', attacks.length, 'connected:', isConnected);
    }, [attacks.length, isConnected]);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const topCountries = useMemo(
        () =>
            Object.entries(stats.mostTargetedCountries)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10),
        [stats.mostTargetedCountries]
    );

    const topAttackTypes = useMemo(
        () =>
            Object.entries(stats.attackTypes)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6),
        [stats.attackTypes]
    );

    const recentAttacks = useMemo(
        () =>
            [...attacks]
                .sort(
                    (a, b) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )
                .slice(0, 8),
        [attacks]
    );

    const countryFlags: Record<string, string> = {
        US: '🇺🇸',
        CN: '🇨🇳',
        RU: '🇷🇺',
        DE: '🇩🇪',
        FR: '🇫🇷',
        GB: '🇬🇧',
        BR: '🇧🇷',
        IN: '🇮🇳',
        JP: '🇯🇵',
        KR: '🇰🇷',
        CA: '🇨🇦',
        AU: '🇦🇺',
        IT: '🇮🇹',
        ES: '🇪🇸',
        NL: '🇳🇱',
    };

    const getCountryFlag = (country: string) => countryFlags[country] || '🏴';

    const criticalCount = attacks.filter((a) => a.intensity === 'high').length;
    const mediumCount = attacks.filter((a) => a.intensity === 'medium').length;
    const lowCount = attacks.filter((a) => a.intensity === 'Low').length;
    const maxAttackTypeCount = Math.max(...Object.values(stats.attackTypes), 1);

    return (
        <>
            {/* Left Sidebar */}
            <div className="absolute top-6 left-6 z-10 w-96 max-h-[calc(100vh-100px)] overflow-y-auto">
                <div className="space-y-4 pr-2">
                    {/* Header Panel */}
                    <div className="threat-panel rounded-xl p-6 border border-purple-500/20 bg-black/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                                    THREAT MAP
                                </h1>
                            </div>
                            <div
                                className={`w-3 h-3 rounded-full ${isConnected
                                        ? 'bg-green-400 shadow-lg shadow-green-400'
                                        : 'bg-red-400 shadow-lg shadow-red-400'
                                    } animate-pulse`}
                            />
                        </div>
                        <p className="text-gray-300 text-sm">LIVE CYBER ATTACK THREAT INTELLIGENCE</p>
                    </div>

                    {/* Attack Statistics */}
                    <div className="threat-panel rounded-xl p-6 border border-purple-500/20 bg-black/40 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4 text-purple-300 uppercase tracking-wide">
                            Attacks Today
                        </h3>
                        <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text mb-4">
                            {formatNumber(stats.totalAttacks)}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                                <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">Critical</div>
                            </div>
                            <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                                <div className="text-2xl font-bold text-yellow-400">{mediumCount}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">Medium</div>
                            </div>
                            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                                <div className="text-2xl font-bold text-green-400">{lowCount}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">Low</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Targeted Countries */}
                    <div className="threat-panel rounded-xl p-6 border border-purple-500/20 bg-black/40 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4 text-purple-300 uppercase tracking-wide flex items-center">
                            <span className="text-red-400 mr-2">▲</span>
                            Top Targets
                        </h3>
                        <div className="space-y-3">
                            {topCountries.map(([country, count], index) => (
                                <div
                                    key={country}
                                    className="flex items-center justify-between p-3 rounded-lg bg-purple-900/10 hover:bg-purple-900/20 border border-purple-500/10 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-purple-400 font-mono w-5">#{index + 1}</span>
                                        <span className="text-lg">{getCountryFlag(country)}</span>
                                        <span className="text-sm font-medium text-white">{country}</span>
                                    </div>
                                    <span className="text-lg font-bold text-red-400 font-mono">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attack Types */}
                    <div className="threat-panel rounded-xl p-6 border border-purple-500/20 bg-black/40 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4 text-purple-300 uppercase tracking-wide">
                            Attack Types
                        </h3>
                        <div className="space-y-3">
                            {topAttackTypes.map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between p-2">
                                    <span className="text-sm text-white truncate pr-2">{type}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(
                                                        (count / maxAttackTypeCount) * 100,
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-orange-400 font-mono w-8 text-right">
                                            {count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Attack Feed - Bottom Panel */}
            <div className="absolute bottom-6 left-6 right-6 z-10 max-w-4xl">
                <div className="threat-panel rounded-xl p-6 border border-purple-500/20 bg-black/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-purple-300 uppercase tracking-wide flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                            Live Attack Feed
                        </h3>
                        <span className="text-sm text-gray-400 font-mono">{attacks.length} Active</span>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-full">
                            <div className="grid grid-cols-6 gap-4 text-xs font-bold text-purple-300 uppercase tracking-widest mb-3 px-2 pb-3 border-b border-purple-500/20">
                                <div>Time</div>
                                <div>Attack</div>
                                <div>Source</div>
                                <div>Target</div>
                                <div>Type</div>
                                <div>Severity</div>
                            </div>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                {recentAttacks.map((attack) => (
                                    <div
                                        key={attack.id}
                                        className="grid grid-cols-6 gap-4 text-sm py-2 px-2 rounded-lg hover:bg-purple-900/20 transition-all border-l-2 border-transparent hover:border-purple-500"
                                    >
                                        <div className="text-gray-300 font-mono text-xs">
                                            {new Date(attack.timestamp).toLocaleTimeString()}
                                        </div>
                                        <div className="text-red-400 font-mono text-xs truncate">
                                            {attack.attackType.replace(/\s+/g, '_').toUpperCase()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">{getCountryFlag(attack.sourceLocation.country)}</span>
                                            <span className="text-orange-400 text-xs font-mono">
                                                {attack.sourceLocation.country}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">{getCountryFlag(attack.targetLocation.country)}</span>
                                            <span className="text-blue-400 text-xs font-mono">
                                                {attack.targetLocation.country}
                                            </span>
                                        </div>
                                        <div className="text-gray-300 text-xs truncate">{attack.attackType}</div>
                                        <div
                                            className={`text-xs font-bold ${attack.intensity === 'high'
                                                    ? 'text-red-400'
                                                    : attack.intensity === 'medium'
                                                        ? 'text-yellow-400'
                                                        : 'text-green-400'
                                                }`}
                                        >
                                            {attack.intensity.toUpperCase()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

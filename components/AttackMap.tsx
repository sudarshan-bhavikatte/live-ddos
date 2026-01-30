'use client';

import React, { useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Attack } from '@/types/attack';


// Fix Leaflet default icon issue
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
}

interface AttackMapProps {
    attacks: Attack[];
}


export default function AttackMap({ attacks }: AttackMapProps) {
    const mapRef = useRef<L.Map | null>(null);

    React.useEffect(() => {
        console.log('[v0] AttackMap mounted with attacks:', attacks.length);
    }, [attacks]);

    const createCustomMarker = (intensity: string, isSource: boolean) => {
        const colors: Record<
            string,
            { main: string; shadow: string }
        > = {
            Low: { main: '#10b981', shadow: '#10b981' },
            medium: { main: '#f59e0b', shadow: '#f59e0b' },
            high: { main: '#ef4444', shadow: '#ef4444' },
            critical: { main: '#7f1d1d', shadow: '#b91c1c' },
        };

        const color =
            colors[intensity as keyof typeof colors] ||
            { main: '#6b7280', shadow: '#6b7280' };

        let size = 12;
        let pulseSize = 18;

        if (intensity === 'critical') {
            size = 24;
            pulseSize = 36;
        } else if (intensity === 'high') {
            size = 20;
            pulseSize = 30;
        } else if (intensity === 'medium') {
            size = 16;
            pulseSize = 24;
        }

        if (isSource) {
            return L.divIcon({
                className: 'custom-div-icon',
                html: `
          <div class="attack-marker" style="
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, ${color.main} 0%, ${color.main}cc 70%, transparent 100%);
            border: 3px solid ${color.main};
            border-radius: 50%;
            position: relative;
            animation: attackPulse 1.5s ease-in-out infinite;
            box-shadow: 0 0 20px ${color.shadow}, 0 0 40px ${color.shadow}44, inset 0 0 10px rgba(255,255,255,0.3);
          ">
            <div style="
              position: absolute;
              top: -8px; left: -8px; right: -8px; bottom: -8px;
              border: 2px solid ${color.main}88;
              border-radius: 50%;
              animation: attackRipple 2s ease-out infinite;
            "></div>
          </div>
        `,
                iconSize: [pulseSize, pulseSize],
                iconAnchor: [pulseSize / 2, pulseSize / 2],
            });
        } else {
            return L.divIcon({
                className: 'custom-div-icon',
                html: `
          <div style="
            width: 14px;
            height: 14px;
            background: radial-gradient(circle, #3b82f6 0%, #3b82f6cc 70%, transparent 100%);
            border: 2px solid #3b82f6;
            border-radius: 50%;
            animation: attackPulse 1.8s ease-in-out infinite;
            box-shadow: 0 0 15px #3b82f6, 0 0 30px #3b82f688;
          "></div>
        `,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
            });
        }
    };

    const getIntensityColors = (
        intensity: string
    ): { main: string; glow: string; shadow: string } => {
        switch (intensity) {
            case 'critical':
                return { main: '#ff0000', glow: '#ff3333', shadow: '#ff000066' };
            case 'high':
                return { main: '#ff4444', glow: '#ff6666', shadow: '#ff444444' };
            case 'medium':
                return { main: '#ff8800', glow: '#ffaa33', shadow: '#ff880044' };
            case 'Low':
                return { main: '#00ff88', glow: '#33ffaa', shadow: '#00ff8844' };
            default:
                return { main: '#888888', glow: '#aaaaaa', shadow: '#88888844' };
        }
    };

    const renderedAttacks = useMemo(
        () =>
            attacks.map((attack) => {
                const colors = getIntensityColors(attack.intensity);
                const lineWeight =
                    attack.intensity === 'high'
                        ? 4
                        : attack.intensity === 'medium'
                            ? 3
                            : 2;
                const dashArray =
                    attack.intensity === 'high'
                        ? '30 15'
                        : attack.intensity === 'medium'
                            ? '20 10'
                            : '15 8';

                return {
                    attack,
                    colors,
                    lineWeight,
                    dashArray,
                };
            }),
        [attacks]
    );

    if (!attacks || attacks.length === 0) {
        console.log('[v0] No attacks to display on map');
    }

    return (
        <div className="absolute inset-0 w-full h-full">
            <MapContainer
                ref={mapRef}
                center={[30, 0]}
                zoom={2}
                minZoom={2}
                maxBounds={[[-90, -180], [90, 180]]}
                maxBoundsViscosity={1.0}
                style={{ height: '100%', width: '100%', background: '#000000' }}
                className="z-0 h-full w-full "
                preferCanvas={true}
            >
                <TileLayer
                    attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    subdomains={['a', 'b', 'c', 'd']}
                    noWrap={true}
                />

                {renderedAttacks.map(({ attack, colors, lineWeight, dashArray }) => (
                    <React.Fragment key={attack.id}>
                        {/* Glow effect for attack line */}
                        <Polyline
                            positions={[
                                [
                                    attack.sourceLocation.latitude,
                                    attack.sourceLocation.longitude,
                                ],
                                [
                                    attack.targetLocation.latitude,
                                    attack.targetLocation.longitude,
                                ],
                            ]}
                            pathOptions={{
                                color: colors.glow,
                                weight: lineWeight * 2.5,
                                opacity: 0.3,
                                className: 'attack-line-glow',
                            }}
                        />

                        {/* Main attack line */}
                        <Polyline
                            positions={[
                                [
                                    attack.sourceLocation.latitude,
                                    attack.sourceLocation.longitude,
                                ],
                                [
                                    attack.targetLocation.latitude,
                                    attack.targetLocation.longitude,
                                ],
                            ]}
                            pathOptions={{
                                color: colors.main,
                                weight: lineWeight,
                                opacity: 0.9,
                                dashArray: dashArray,
                                className: 'attack-line',
                            }}
                        />

                        {/* Source marker */}
                        <Marker
                            position={[
                                attack.sourceLocation.latitude,
                                attack.sourceLocation.longitude,
                            ]}
                            icon={createCustomMarker(attack.intensity, true)}
                            zIndexOffset={1000}
                        >
                            <Popup className="threat-popup">
                                <div className="bg-gray-900 text-white p-4 rounded-lg border border-red-500/30">
                                    <h3 className="font-bold text-red-400 text-lg mb-2">
                                        {'🔥 ATTACK SOURCE'}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <strong className="text-orange-400">IP:</strong>{' '}
                                            {attack.sourceIP}
                                        </p>
                                        <p>
                                            <strong className="text-orange-400">Location:</strong>{' '}
                                            {attack.sourceLocation.city},{' '}
                                            {attack.sourceLocation.country}
                                        </p>
                                        <p>
                                            <strong className="text-orange-400">Attack:</strong>{' '}
                                            {attack.attackType}
                                        </p>
                                        <p>
                                            <strong className="text-orange-400">Severity:</strong>{' '}
                                            <span
                                                className={`font-bold ${attack.intensity === 'high'
                                                    ? 'text-red-400'
                                                    : attack.intensity === 'medium'
                                                        ? 'text-yellow-400'
                                                        : 'text-green-400'
                                                    }`}
                                            >
                                                {attack.intensity}
                                            </span>
                                        </p>
                                        <p>
                                            <strong className="text-orange-400">Bandwidth:</strong>{' '}
                                            {attack.bandwidth} Mbps
                                        </p>
                                        <p>
                                            <strong className="text-orange-400">Packets:</strong>{' '}
                                            {attack.packetCount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Target marker */}
                        <Marker
                            position={[
                                attack.targetLocation.latitude,
                                attack.targetLocation.longitude,
                            ]}
                            icon={createCustomMarker(attack.intensity, false)}
                            zIndexOffset={500}
                        >
                            <Popup className="threat-popup">
                                <div className="bg-gray-900 text-white p-4 rounded-lg border border-blue-500/30">
                                    <h3 className="font-bold text-blue-400 text-lg mb-2">
                                        {'🎯 TARGET'}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <strong className="text-blue-300">IP:</strong>{' '}
                                            {attack.targetIP}
                                        </p>
                                        <p>
                                            <strong className="text-blue-300">Location:</strong>{' '}
                                            {attack.targetLocation.city},{' '}
                                            {attack.targetLocation.country}
                                        </p>
                                        <p>
                                            <strong className="text-blue-300">Duration:</strong>{' '}
                                            {attack.duration}s
                                        </p>
                                        <p>
                                            <strong className="text-blue-300">Status:</strong>{' '}
                                            <span className="text-red-400 font-bold">
                                                Under Attack
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
}

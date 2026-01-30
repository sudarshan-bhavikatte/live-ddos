'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Attack, AttackStats } from '@/types/attack';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [attacks, setAttacks] = useState<Attack[]>([]);
    const [stats, setStats] = useState<AttackStats>({
        totalAttacks: 0,
        attacksToday: 0,
        mostTargetedCountries: {},
        attackTypes: {}
    });
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log('[v0] useSocket: Initializing socket connection');
        // Create socket connection
        const newSocket = io(SERVER_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('[v0] useSocket: Connected to server');
            setIsConnected(true);
        });

        newSocket.on('connect_error', (error) => {
            console.log('[v0] useSocket: Connection error:', error.message);
        });

        newSocket.on('disconnect', () => {
            console.log('[v0] useSocket: Disconnected from server');
            setIsConnected(false);
        });

        // Data event handlers
        newSocket.on('initial_attacks', (initialAttacks: Attack[]) => {
            console.log('[v0] useSocket: Received initial attacks:', initialAttacks.length);
            setAttacks(initialAttacks);
        });

        newSocket.on('new_attacks', (newAttacks: Attack[]) => {
            console.log('[v0] useSocket: Received new attacks:', newAttacks.length);
            setAttacks((prev) => {
                // Remove old attacks (older than 5 minutes) and add new ones
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                const filteredAttacks = prev.filter(
                    (attack) => new Date(attack.timestamp) > fiveMinutesAgo
                );
                return [...filteredAttacks, ...newAttacks];
            });
        });

        newSocket.on('attack_stats', (newStats: AttackStats) => {
            console.log('[v0] useSocket: Received attack stats');
            setStats(newStats);
        });

        setSocket(newSocket);

        return () => {
            console.log('[v0] useSocket: Cleaning up socket connection');
            newSocket.disconnect();
        };
    }, []);

    const requestUpdate = () => {
        if (socket) {
            console.log('[v0] useSocket: Requesting update from server');
            socket.emit('request_update');
        }
    };

    return {
        socket,
        attacks,
        stats,
        isConnected,
        requestUpdate,
    };
};

export interface AttackLocation {
    latitude: number;
    longitude: number;
    country: string;
    city: string;
    region: string;
}

export interface Attack {
    id: string;
    sourceIP: string;
    targetIP: string;
    sourceLocation: AttackLocation;
    targetLocation: AttackLocation;
    attackType: string;
    intensity: 'Low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    duration: number;
    packetCount: number;
    bandwidth: number;
}

export interface AttackStats {
    totalAttacks: number;
    attacksToday: number;
    mostTargetedCountries: Record<string, number>;
    attackTypes: Record<string, number>;
}
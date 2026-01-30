import type { Express, Request, Response } from "express";
import express from "express";
import http from "http";
import { Server } from 'socket.io';
import cors from 'cors';
import axios from "axios";
import cron from "node-cron";
import dotenv from "dotenv";

dotenv.config({ path: ['.env', '.env.local'] });



const app: Express = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:8888",
        methods: ["GET", "POST"]
    }
})

const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());


const APIS = {
    abuseipdb: {
        url: 'https://api.abuseipdb.com/api/v2/check',
        key: process.env.ABUSEIPDB_API_KEY || 'demo_key'
    },
    ipinfo: {
        url: 'https://ipinfo.io',
        key: process.env.IPINFO_API_KEY || 'demo_key'
    }
};

const countries: string[] = ['US', 'CN', 'RU', 'DE', 'FR', 'GB', 'BR', 'IN', 'JP', 'KR'];


interface Attack {
    id: string;
    sourceIP: string;
    targetIP: string;
    sourceLocation: {
        latitude: number;
        longitude: number;
        country: string;
        city: string;
        region: string;
    };
    targetLocation: {
        latitude: number;
        longitude: number;
        country: string;
        city: string;
        region: string;
    };
    attackType: string;
    intensity: string;
    timestamp: Date;
    duration: number;
    packetCount: number;
    bandwidth: number;
}


const ATTACK_TYPES: string[] = [
    ...Array(5).fill('HTTP Flood'),
    ...Array(3).fill('UDP Flood'),
    ...Array(2).fill('SYN Flood'),
    'DNS Amplification',
    'NTP Amplification',
    'ICMP Flood'
];

const TARGETS: Record<string, string[]> = {
    dns: ['8.8.8.8', '1.1.1.1', '9.9.9.9'],
    cdn: ['104.16.249.249', '151.101.1.140'],
    cloud: ['13.107.42.14', '172.217.14.206']
};

const MALICIOUS_RANGES: string[] = [
    '45.95.169', '185.220.101', '198.98.51', '107.189.10',
    '194.58.56', '37.252.64', '89.248.167', '91.240.118'
];

const INTENSITY: string[] = ['Low', 'medium', 'high', 'critical'];

const TIMELIMIT = new Date(Date.now() - 5 * 60 * 1000);

//@ts-ignore
let liveAttacks: Attack[] = [];

let attackStats = {
    totalAttacks: 0,
    numberOfAttacksToday: 0,
    mostTargetedCountries: {},
    attackTypes: {}
};


const getIPLocation = async (ip: string) => {
    try {
        const res = await axios.get(`${APIS.ipinfo.url}/${ip}`, {
            headers: {
                Authorization: `Bearer ${APIS.ipinfo.key}`
            }
        })
        const data = res.data

        if (data.loc) {
            const [latitude, longitude] = data.loc.split(',');
            return {
                latitude: Number(latitude),
                longitude: Number(longitude),
                country: data.country,
                city: data.city,
                region: data.region
            }
        }

    }
    catch {
        console.log('error');
    }

    return getRandomLocation();
}

const getRandomLocation = () => {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    return {
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180,
        country: randomCountry,
        city: 'unknown',
        region: 'unknown'
    }
}

const pickTarget = () => {
    return Object.keys(TARGETS)[Math.floor(Math.random() * Object.keys(TARGETS).length)]
}

const getAttackData = async () => {
    const attackType = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
    const target = TARGETS[pickTarget()];

    const attacks = [];

    const numAttacks = Math.floor(Math.random() * 8) + 3;

    for (let i = 0; i < numAttacks; i++) {
        const sourceRange = MALICIOUS_RANGES[Math.floor(Math.random() * MALICIOUS_RANGES.length)];
        const sourceIP = `${sourceRange}.${Math.floor(Math.random() * 255)}`;
        const targetIP = target[Math.floor(Math.random() * target.length)];


        const [sourceLocation, targetLocation] = await Promise.all([
            getIPLocation(sourceIP),
            getIPLocation(targetIP)
        ]);

        const attackType = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
        const intensity = INTENSITY[Math.floor(Math.random() * INTENSITY.length)];

        const attack = {
            id: `attack_${Date.now()}_${i}`,
            sourceIP,
            targetIP,
            sourceLocation,
            targetLocation,
            attackType,
            intensity,
            timestamp: new Date(),
            duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
            packetCount: Math.floor(Math.random() * 100000) + 10000,
            bandwidth: Math.floor(Math.random() * 1000) + 100 // Mbps
        };

        attacks.push(attack);

        attackStats.totalAttacks++;
        attackStats.numberOfAttacksToday++;
        //@ts-ignore
        attackStats.mostTargetedCountries[targetLocation.country] = (attackStats.mostTargetedCountries[targetLocation.country] || 0) + 1;
        //@ts-ignore
        attackStats.attackTypes[attackType] = (attackStats.attackTypes[attackType] || 0) + 1;

    }

    return attacks;
}



const fetchThreatData = async () => {

    try {



        const attacks = await getAttackData();
        liveAttacks.push(...attacks);


        //@ts-ignore
        liveAttacks = liveAttacks.filter(attack =>
            new Date(attack.timestamp) > TIMELIMIT
        );

        io.emit('new_attacks', attacks);
        io.emit('attack_stats', attackStats);

        console.log(`Generated ${attacks.length} new attacks. Total active: ${liveAttacks.length}`);
    }
    catch {
        console.log('error');
    }
    return;
}

app.get('/', (req, res) => {
    res.json({
        message: 'Live DDoS Map API',
        version: '1.0.0',
        endpoints: {
            '/api/attacks': 'Get current active attacks',
            '/api/stats': 'Get attack statistics',
            '/socket.io': 'WebSocket connection for real-time updates'
        }
    });
});

app.get('/api/attacks', (req, res) => {
    res.json({
        success: true,
        count: liveAttacks.length,
        attacks: liveAttacks
    });
});

app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        stats: attackStats
    });
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send current data to new client
    socket.emit('initial_attacks', liveAttacks);
    socket.emit('attack_stats', attackStats);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    socket.on('request_update', () => {
        socket.emit('new_attacks', liveAttacks);
        socket.emit('attack_stats', attackStats);
    });
});

// Schedule regular data fetching (every 10 seconds)
cron.schedule('*/10 * * * * *', () => {
    fetchThreatData();
});

// Initial data fetch
fetchThreatData();

server.listen(PORT, () => {
    console.log(`🚀 Live DDoS Map Backend running on http://localhost:${PORT}`);
    console.log(`📊 WebSocket server ready for real-time connections`);
    console.log(`🔄 Fetching threat intelligence data every 10 seconds`);
});
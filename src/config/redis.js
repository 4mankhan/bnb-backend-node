// src/config/redis.js

import Redis from 'ioredis';

const redisURL = process.env.AIVEN_VALKEY_URL;
if (!redisURL) {
    throw new Error(' AIVEN_VALKEY_URL is not defined');
}

export const valKey = new Redis(redisURL, {
    tls: {},
});

valKey.on('connect', () => {
    console.log('Connected to Aiven Valkey');
});

valKey.on('error', (err) => {
    console.error(' Valkey connection error:', err.message);
});

process.on('SIGINT', async () => {
    console.log('Disconnecting cache...');
    await valKey.quit();
    process.exit(0);
});

export default valKey;
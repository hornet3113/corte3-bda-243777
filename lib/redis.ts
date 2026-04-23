import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6380');

redis.on('connect', () => console.log('[REDIS] Conectado'));
redis.on('error', (err) => console.error('[REDIS] Error:', err));

export default redis;
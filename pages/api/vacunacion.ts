import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';
import redis from '../../lib/redis';

const CACHE_KEY = 'vacunacion_pendiente';
const CACHE_TTL = 300;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { rol } = req.query;

  if (rol === 'recepcion') {
    return res.status(403).json({
      error: 'Acceso denegado — recepción no tiene permisos para ver vacunación'
    });
  }

  try {
    const cached = await redis.get(CACHE_KEY);

    if (cached) {
      console.log('[CACHE HIT] vacunacion_pendiente');
      return res.status(200).json({
        source: 'cache',
        data: JSON.parse(cached)
      });
    }

    console.log('[CACHE MISS] vacunacion_pendiente — consultando BD');
    const start = Date.now();

    const result = await pool.query(
      'SELECT * FROM v_mascotas_vacunacion_pendiente'
    );

    const latencia = Date.now() - start;
    console.log(`[BD] Consulta completada en ${latencia}ms`);

    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(result.rows));
    console.log(`[CACHE SET] vacunacion_pendiente — TTL: ${CACHE_TTL}s`);

    return res.status(200).json({
      source: 'database',
      latencia_ms: latencia,
      data: result.rows
    });

  } catch (error) {
    console.error('[VACUNACION] Error:', error);
    return res.status(500).json({ error: 'Error al consultar vacunación' });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';
import redis from '../../lib/redis';

const CACHE_KEY = 'vacunacion_pendiente';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { mascota_id, vacuna_id, veterinario_id, costo_cobrado } = req.body;

  if (!mascota_id || !vacuna_id || !veterinario_id) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const client = await pool.connect();

  try {
    // Insertar la vacuna aplicada con query parametrizada
    await client.query(
      `INSERT INTO vacunas_aplicadas 
        (mascota_id, vacuna_id, veterinario_id, costo_cobrado) 
       VALUES ($1, $2, $3, $4)`,
      [mascota_id, vacuna_id, veterinario_id, costo_cobrado || 0]
    );

    // Invalidar el caché — los datos cambiaron
    await redis.del(CACHE_KEY);
    console.log('[CACHE INVALIDADO] vacunacion_pendiente — se aplicó una vacuna nueva');

    return res.status(201).json({ mensaje: 'Vacuna aplicada correctamente' });

  } catch (error: any) {
    console.error('[VACUNAS] Error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { mascota_id, veterinario_id, fecha_hora, motivo } = req.body;

  if (!mascota_id || !veterinario_id || !fecha_hora) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      'CALL sp_agendar_cita($1, $2, $3, $4, NULL)',
      [mascota_id, veterinario_id, fecha_hora, motivo || '']
    );

    return res.status(201).json({
      mensaje: 'Cita agendada correctamente',
      cita_id: result.rows[0]?.p_cita_id
    });

  } catch (error: any) {
    console.error('[CITAS] Error:', error);
    return res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
}
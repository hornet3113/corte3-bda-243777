import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { nombre, vet_id, rol } = req.query;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (rol === 'veterinario' && vet_id) {
      await client.query(
        'SELECT set_config($1, $2, false)',
        ['app.current_vet_id', String(vet_id)]
      );
      await client.query('SET LOCAL ROLE rol_veterinario');
    } else if (rol === 'recepcion') {
      await client.query('SET LOCAL ROLE rol_recepcion');
    } else if (rol === 'admin') {
      await client.query('SET LOCAL ROLE rol_admin');
    }

    let result;

    if (nombre && typeof nombre === 'string' && nombre.trim() !== '') {
      // HARDENING: query parametrizada — archivo mascotas.ts línea 30
      // El input del usuario nunca se concatena al SQL
      result = await client.query(
        `SELECT m.id, m.nombre, m.especie, m.fecha_nacimiento,
                d.nombre AS dueno, d.telefono
         FROM mascotas m
         JOIN duenos d ON d.id = m.dueno_id
         WHERE m.nombre ILIKE $1
         ORDER BY m.nombre`,
        [`%${nombre.trim()}%`]  // línea 30 — parametrizado
      );
    } else {
      result = await client.query(
        `SELECT m.id, m.nombre, m.especie, m.fecha_nacimiento,
                d.nombre AS dueno, d.telefono
         FROM mascotas m
         JOIN duenos d ON d.id = m.dueno_id
         ORDER BY m.nombre`
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({ mascotas: result.rows });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[MASCOTAS] Error:', error);
    return res.status(500).json({ error: 'Error al consultar mascotas' });
  } finally {
    client.release();
  }
}
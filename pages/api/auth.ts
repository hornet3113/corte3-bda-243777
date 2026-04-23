import type { NextApiRequest, NextApiResponse } from 'next';

// Mapa de usuarios a sus vet_id
// Los usuarios que no son veterinarios tienen vet_id null
const USUARIOS: Record<string, { rol: string; vet_id: number | null; db_user: string }> = {
  vet_lopez:   { rol: 'veterinario', vet_id: 1, db_user: 'vet_lopez' },
  vet_garcia:  { rol: 'veterinario', vet_id: 2, db_user: 'vet_garcia' },
  vet_mendez:  { rol: 'veterinario', vet_id: 3, db_user: 'vet_mendez' },
  recepcion1:  { rol: 'recepcion',   vet_id: null, db_user: 'recepcion1' },
  admin1:      { rol: 'admin',       vet_id: null, db_user: 'admin1' },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { usuario } = req.body;

  if (!usuario || !USUARIOS[usuario]) {
    return res.status(400).json({ error: 'Usuario inválido' });
  }

  return res.status(200).json(USUARIOS[usuario]);
}
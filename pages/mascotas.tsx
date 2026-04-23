import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  fecha_nacimiento: string;
  dueno: string;
  telefono: string;
}

interface Usuario {
  value: string;
  label: string;
  rol: string;
  vet_id: number | null;
}

export default function Mascotas() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem('usuario');
    if (!data) { router.push('/'); return; }
    setUsuario(JSON.parse(data));
  }, []);

  const buscarMascotas = async () => {
    if (!usuario) return;
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        rol: usuario.rol,
        ...(usuario.vet_id && { vet_id: String(usuario.vet_id) }),
        ...(busqueda.trim() && { nombre: busqueda.trim() }),
      });

      const res = await fetch(`/api/mascotas?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setMascotas(data.mascotas);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar mascotas al entrar
  useEffect(() => {
    if (usuario) buscarMascotas();
  }, [usuario]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mascotas</h1>
          <p className="text-gray-400 text-sm">
            {usuario?.label} · {usuario?.rol}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/vacunacion')}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
          >
            Vacunación Pendiente
          </button>
          <button
            onClick={() => { sessionStorage.clear(); router.push('/'); }}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Búsqueda — superficie principal para SQL injection */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && buscarMascotas()}
          placeholder="Buscar por nombre... (prueba: ' OR '1'='1)"
          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
        />
        <button
          onClick={buscarMascotas}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {/* Tabla de resultados */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700 text-gray-300 text-sm">
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Especie</th>
              <th className="text-left px-4 py-3">Dueño</th>
              <th className="text-left px-4 py-3">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {mascotas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-8">
                  {loading ? 'Cargando...' : 'No se encontraron mascotas'}
                </td>
              </tr>
            ) : (
              mascotas.map(m => (
                <tr key={m.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3 text-gray-400">{m.id}</td>
                  <td className="px-4 py-3 font-medium">{m.nombre}</td>
                  <td className="px-4 py-3 text-gray-300">{m.especie}</td>
                  <td className="px-4 py-3 text-gray-300">{m.dueno}</td>
                  <td className="px-4 py-3 text-gray-400">{m.telefono}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-2 text-gray-500 text-sm border-t border-gray-700">
          {mascotas.length} resultado(s)
        </div>
      </div>
    </div>
  );
}
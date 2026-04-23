import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface VacunaPendiente {
  mascota_id: number;
  mascota_nombre: string;
  especie: string;
  dueno_nombre: string;
  dueno_telefono: string;
  vacuna_nombre: string;
  stock_actual: number;
}

export default function Vacunacion() {
  const [data, setData] = useState<VacunaPendiente[]>([]);
  const [source, setSource] = useState('');
  const [latencia, setLatencia] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = sessionStorage.getItem('usuario');
    if (!saved) { router.push('/'); return; }
    setUsuario(JSON.parse(saved));
  }, []);

  const cargarVacunacion = async () => {
    setLoading(true);
    const start = Date.now();

    try {
      const res = await fetch('/api/vacunacion');
      const json = await res.json();

      setData(json.data || []);
      setSource(json.source);
      setLatencia(json.latencia_ms ?? Date.now() - start);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario) cargarVacunacion();
  }, [usuario]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vacunación Pendiente</h1>
          <p className="text-gray-400 text-sm">{usuario?.label}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/mascotas')}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
          >
            ← Mascotas
          </button>
        </div>
      </div>

      {/* Badge de caché — superficie para demo Redis */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={cargarVacunacion}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold"
        >
          {loading ? 'Consultando...' : 'Recargar'}
        </button>

        {source && (
          <div className={`px-3 py-1 rounded text-sm font-mono font-bold ${
            source === 'cache'
              ? 'bg-green-900 text-green-300 border border-green-700'
              : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
          }`}>
            {source === 'cache' ? '⚡ CACHE HIT' : '🗄️ CACHE MISS'}
            {latencia !== null && ` · ${latencia}ms`}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700 text-gray-300 text-sm">
              <th className="text-left px-4 py-3">Mascota</th>
              <th className="text-left px-4 py-3">Especie</th>
              <th className="text-left px-4 py-3">Dueño</th>
              <th className="text-left px-4 py-3">Teléfono</th>
              <th className="text-left px-4 py-3">Vacuna Pendiente</th>
              <th className="text-left px-4 py-3">Stock</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-8">
                  {loading ? 'Cargando...' : 'Sin vacunaciones pendientes'}
                </td>
              </tr>
            ) : (
              data.map((v, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-4 py-3 font-medium">{v.mascota_nombre}</td>
                  <td className="px-4 py-3 text-gray-300">{v.especie}</td>
                  <td className="px-4 py-3 text-gray-300">{v.dueno_nombre}</td>
                  <td className="px-4 py-3 text-gray-400">{v.dueno_telefono}</td>
                  <td className="px-4 py-3 text-yellow-400">{v.vacuna_nombre}</td>
                  <td className="px-4 py-3 text-gray-300">{v.stock_actual}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-2 text-gray-500 text-sm border-t border-gray-700">
          {data.length} resultado(s)
        </div>
      </div>
    </div>
  );
}
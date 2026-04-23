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
    <div className="min-h-screen p-6" style={{ backgroundColor: '#FFF8EE' }}>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vacunación Pendiente</h1>
          <p className="text-sm text-gray-500">{usuario?.label}</p>
        </div>
        <button
          onClick={() => router.push('/mascotas')}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
        >
          ← Mascotas
        </button>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={cargarVacunacion}
          disabled={loading}
          className="px-6 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#F5C800' }}
        >
          {loading ? 'Consultando...' : 'Recargar'}
        </button>

        {source && (
          <div className={`px-3 py-1 rounded-lg text-sm font-mono font-bold border ${
            source === 'cache'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {source === 'cache' ? '⚡ CACHE HIT' : '🗄️ CACHE MISS'}
            {latencia !== null && ` · ${latencia}ms`}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-600" style={{ backgroundColor: '#FFF0C2' }}>
              <th className="text-left px-4 py-3 font-semibold">Mascota</th>
              <th className="text-left px-4 py-3 font-semibold">Especie</th>
              <th className="text-left px-4 py-3 font-semibold">Dueño</th>
              <th className="text-left px-4 py-3 font-semibold">Teléfono</th>
              <th className="text-left px-4 py-3 font-semibold">Vacuna Pendiente</th>
              <th className="text-left px-4 py-3 font-semibold">Stock</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-10">
                  {loading ? 'Cargando...' : 'Sin vacunaciones pendientes'}
                </td>
              </tr>
            ) : (
              data.map((v, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-amber-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{v.mascota_nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{v.especie}</td>
                  <td className="px-4 py-3 text-gray-600">{v.dueno_nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{v.dueno_telefono}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: '#E8A800' }}>{v.vacuna_nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{v.stock_actual}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-2 text-gray-400 text-sm border-t border-gray-100">
          {data.length} resultado(s)
        </div>
      </div>
    </div>
  );
}

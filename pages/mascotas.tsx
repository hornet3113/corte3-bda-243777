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

  useEffect(() => {
    if (usuario) buscarMascotas();
  }, [usuario]);

  const [mostrarFormVacuna, setMostrarFormVacuna] = useState(false);
  const [vacunaForm, setVacunaForm] = useState({
    mascota_id: '',
    vacuna_id: '',
    costo_cobrado: ''
  });
  const [msgVacuna, setMsgVacuna] = useState('');

  const aplicarVacuna = async () => {
    if (!vacunaForm.mascota_id || !vacunaForm.vacuna_id) {
      setMsgVacuna('Completa los campos requeridos');
      return;
    }
    try {
      const res = await fetch('/api/vacunas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mascota_id: parseInt(vacunaForm.mascota_id),
          vacuna_id: parseInt(vacunaForm.vacuna_id),
          veterinario_id: usuario?.vet_id,
          costo_cobrado: parseFloat(vacunaForm.costo_cobrado) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsgVacuna('✅ Vacuna aplicada — caché invalidado');
      setVacunaForm({ mascota_id: '', vacuna_id: '', costo_cobrado: '' });
    } catch (err: any) {
      setMsgVacuna(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#FFF8EE' }}>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mascotas</h1>
          <p className="text-sm text-gray-500">{usuario?.label} · {usuario?.rol}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/vacunacion')}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#F5C800' }}
          >
            Vacunación Pendiente
          </button>
          <button
            onClick={() => { sessionStorage.clear(); router.push('/'); }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && buscarMascotas()}
          placeholder="Buscar por nombre de mascota..."
          className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2"
          style={{ focusRingColor: '#F5C800' } as React.CSSProperties}
        />
        <button
          onClick={buscarMascotas}
          disabled={loading}
          className="px-6 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#F5C800' }}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          Error: {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-600" style={{ backgroundColor: '#FFF0C2' }}>
              <th className="text-left px-4 py-3 font-semibold">ID</th>
              <th className="text-left px-4 py-3 font-semibold">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold">Especie</th>
              <th className="text-left px-4 py-3 font-semibold">Dueño</th>
              <th className="text-left px-4 py-3 font-semibold">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {mascotas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-10">
                  {loading ? 'Cargando...' : 'No se encontraron mascotas'}
                </td>
              </tr>
            ) : (
              mascotas.map(m => (
                <tr key={m.id} className="border-t border-gray-100 hover:bg-amber-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-sm">{m.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{m.especie}</td>
                  <td className="px-4 py-3 text-gray-600">{m.dueno}</td>
                  <td className="px-4 py-3 text-gray-500">{m.telefono}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-2 text-gray-400 text-sm border-t border-gray-100">
          {mascotas.length} resultado(s)
        </div>
      </div>

      {usuario?.rol === 'veterinario' && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Aplicar Vacuna</h2>
            <button
              onClick={() => setMostrarFormVacuna(!mostrarFormVacuna)}
              className="text-sm px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              {mostrarFormVacuna ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {mostrarFormVacuna && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">ID Mascota</label>
                <input
                  type="number"
                  value={vacunaForm.mascota_id}
                  onChange={e => setVacunaForm({...vacunaForm, mascota_id: e.target.value})}
                  placeholder="ej: 1"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">ID Vacuna</label>
                <input
                  type="number"
                  value={vacunaForm.vacuna_id}
                  onChange={e => setVacunaForm({...vacunaForm, vacuna_id: e.target.value})}
                  placeholder="ej: 1"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Costo</label>
                <input
                  type="number"
                  value={vacunaForm.costo_cobrado}
                  onChange={e => setVacunaForm({...vacunaForm, costo_cobrado: e.target.value})}
                  placeholder="ej: 350"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-3 flex items-center gap-4">
                <button
                  onClick={aplicarVacuna}
                  className="px-6 py-2 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: '#F5C800' }}
                >
                  Aplicar Vacuna
                </button>
                {msgVacuna && (
                  <span className={`text-sm ${msgVacuna.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
                    {msgVacuna}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

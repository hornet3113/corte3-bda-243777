import { useState } from 'react';
import { useRouter } from 'next/router';

const USUARIOS = [
  { value: 'vet_lopez',  label: 'Dr. López (Veterinario)',  rol: 'veterinario', vet_id: 1 },
  { value: 'vet_garcia', label: 'Dra. García (Veterinario)', rol: 'veterinario', vet_id: 2 },
  { value: 'vet_mendez', label: 'Dr. Méndez (Veterinario)',  rol: 'veterinario', vet_id: 3 },
  { value: 'recepcion1', label: 'Recepción',                 rol: 'recepcion',   vet_id: null },
  { value: 'admin1',     label: 'Administrador',             rol: 'admin',       vet_id: null },
];

export default function Login() {
  const [seleccion, setSeleccion] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (!seleccion) return alert('Selecciona un usuario');
    const usuario = USUARIOS.find(u => u.value === seleccion)!;
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    router.push('/mascotas');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FFF8EE' }}>
      <div className="flex w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden bg-white">

        {/* Panel izquierdo */}
        <div
          className="relative w-2/5 flex flex-col justify-between p-8 overflow-hidden"
          style={{ backgroundColor: '#FFF0C2' }}
        >
          {/* Círculos decorativos */}
          <div className="absolute top-10 left-6 w-20 h-20 rounded-full border-4 opacity-50" style={{ borderColor: '#E8B800' }} />
          <div className="absolute bottom-20 right-4 w-14 h-14 rounded-full border-4 opacity-50" style={{ borderColor: '#E8B800' }} />
          <div className="absolute top-1/3 right-10 w-4 h-4 rounded-full bg-white opacity-70" />
          <div className="absolute top-16 right-1/3 w-3 h-3 rounded-full bg-white opacity-70" />

          {/* Texto superior */}
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-gray-800 leading-snug">
              Bienvenido a<br />
              <span style={{ color: '#E8A800' }}>Clínica Veterinaria</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">Para una mejor atención de tus mascotas</p>
          </div>

          {/* Imagen del perro — pon tu archivo en public/dog.png */}
          <div className="relative z-10 flex items-end justify-center" style={{ minHeight: '300px' }}>
            <img
              src="/dog.png"
              alt="mascota"
              className="w-full object-contain"
              style={{ maxHeight: '360px' }}
            />
          </div>
        </div>

        {/* Panel derecho */}
        <div className="flex-1 flex flex-col items-center justify-center px-10 py-14">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">Selecciona tu perfil</h1>

          <div className="w-full mb-5">
            <select
              value={seleccion}
              onChange={e => setSeleccion(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-gray-600 focus:outline-none focus:ring-2"
              style={{ backgroundColor: '#F5F5F5', focusRingColor: '#F5C800' } as React.CSSProperties}
            >
              <option value="">-- Selecciona un usuario --</option>
              {USUARIOS.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogin}
            className="w-full font-semibold py-3 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#F5C800' }}
          >
            🐾 Ingresar
          </button>
        </div>

      </div>
    </div>
  );
}

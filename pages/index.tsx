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

    // Guardar en sessionStorage para usarlo en las otras pantallas
    sessionStorage.setItem('usuario', JSON.stringify(usuario));

    router.push('/mascotas');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-white text-2xl font-bold mb-2">
          Clínica Veterinaria
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Sistema de gestión — Selecciona tu perfil
        </p>

        <label className="text-gray-300 text-sm mb-2 block">
          Usuario
        </label>
        <select
          value={seleccion}
          onChange={e => setSeleccion(e.target.value)}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mb-6"
        >
          <option value="">-- Selecciona --</option>
          {USUARIOS.map(u => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          Ingresar
        </button>
      </div>
    </div>
  );
}
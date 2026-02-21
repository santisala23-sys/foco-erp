'use client';
import { useState } from 'react';
import { supabaseClient } from '../../lib/db';

export default function NuevoProfe() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');

  const registrarProfe = async (e) => {
    e.preventDefault();
    
    // 1. Crea el usuario en Supabase Auth
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { nombre_completo: nombre } }
    });

    if (error) return alert("Error al crear: " + error.message);

    // 2. Crea la entrada en nuestra tabla de perfiles
    await supabaseClient.from('perfiles').insert([
      { id: data.user.id, nombre, email, rol: 'profe' }
    ]);

    alert("¡Profe creado! Ya puede loguearse con su mail.");
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-3xl shadow-sm border mt-10">
      <h2 className="text-2xl font-bold mb-6">Registrar Nuevo Profesor</h2>
      <form onSubmit={registrarProfe} className="space-y-4">
        <input type="text" placeholder="Nombre del Profe" onChange={e => setNombre(e.target.value)} className="w-full p-3 border rounded-xl" required />
        <input type="email" placeholder="Email del Profe" onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-xl" required />
        <input type="password" placeholder="Contraseña Provisoria" onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-xl" required />
        <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">Crear Cuenta de Profe</button>
      </form>
    </div>
  );
}
'use client';
import { useState } from 'react';
import { supabaseClient } from '../lib/db'; // Usamos el nombre que arreglamos hoy
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Login de Profesores</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input 
          type="email" 
          placeholder="Tu Email" 
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 border rounded-xl"
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 border rounded-xl"
        />
        <button className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold">
          Entrar
        </button>
      </form>
    </div>
  );
}
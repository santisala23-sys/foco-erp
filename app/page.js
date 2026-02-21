'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseClient as supabase } from '@/lib/db'; // Usamos el alias que ya sabemos que funciona
import { Users, Package, CalendarCheck, BarChart3, Activity } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [nombreProfe, setNombreProfe] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarPerfil() {
      // 1. Vemos si hay alguien logueado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Si no hay usuario, lo mandamos al login directo
        router.push('/login');
        return;
      }

      // 2. Buscamos el nombre en la tabla perfiles
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre')
        .eq('id', user.id)
        .single();

      if (perfil && perfil.nombre) {
        setNombreProfe(perfil.nombre);
      } else {
        setNombreProfe('Profe'); // Por si justo ese perfil no tiene nombre cargado
      }
      
      setCargando(false);
    }

    cargarPerfil();
  }, [router]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const accesosDirectos = [
    { titulo: 'Asistencia y Operaciones', icono: <CalendarCheck size={32} />, link: '/operaciones', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { titulo: 'Portal de Socios', icono: <Users size={32} />, link: '/socios', color: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
    { titulo: 'Materiales y Stock', icono: <Package size={32} />, link: '/materiales', color: 'bg-amber-500', hover: 'hover:bg-amber-600' },
    { titulo: 'Dashboards y Reportes', icono: <BarChart3 size={32} />, link: '/dashboards', color: 'bg-purple-500', hover: 'hover:bg-purple-600' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-24">
      {/* HEADER PERSONALIZADO */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-slate-800">
          Hola {nombreProfe}
        </h1>
        <p className="text-slate-500 mt-2 text-lg">¿Qué vamos a gestionar hoy en Foco?</p>
      </header>

      {/* GRILLA DE BOTONES GRANDES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accesosDirectos.map((item, index) => (
          <Link href={item.link} key={index}>
            <div className={`${item.color} ${item.hover} transition-all duration-200 text-white rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer group`}>
              <div className="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                {item.icono}
              </div>
              <h2 className="text-2xl font-bold text-center">{item.titulo}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
'use client'; // Esta línea es sagrada, siempre arriba de todo

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseClient as supabase } from './lib/db';
import { Users, Trophy, BarChart3, Package, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [cargando, setCargando] = useState(true);

  // "El Portero" ahora verifica la sesión real en Supabase
  useEffect(() => {
    async function verificarSesion() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Buscamos el nombre del usuario en la tabla perfiles
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre')
        .eq('id', user.id)
        .single();

      if (perfil && perfil.nombre) {
        setNombreUsuario(perfil.nombre);
      } else {
        setNombreUsuario('Profe');
      }
      
      setCargando(false);
    }

    verificarSesion();
  }, [router]);

  const accesosRapidos = [
    {
      titulo: 'Tomar Asistencia',
      descripcion: 'Cargar presentes del día',
      link: '/operaciones',
      icon: <Users className="w-8 h-8 text-emerald-500" />,
      color: 'hover:border-emerald-500'
    },
    {
      titulo: 'Registrar Partido',
      descripcion: 'Cargar goles y resultados',
      link: '/operaciones',
      icon: <Trophy className="w-8 h-8 text-amber-500" />,
      color: 'hover:border-amber-500'
    },
    {
      titulo: 'Ver Estadísticas',
      descripcion: 'Rendimiento y presentismo',
      link: '/dashboards',
      icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
      color: 'hover:border-blue-500'
    },
    {
      titulo: 'Materiales',
      descripcion: 'Reservar y ver stock',
      link: '/materiales',
      icon: <Package className="w-8 h-8 text-purple-500" />,
      color: 'hover:border-purple-500'
    }
  ];

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-10 text-center md:text-left">
        {/* Cambiamos text-slate-900 por text-white */}
        <h1 className="text-3xl font-bold text-white">Hola {nombreUsuario}</h1>
        {/* Cambiamos text-slate-500 por text-slate-300 para que resalte más */}
        <p className="text-slate-300 mt-2">¿Qué vamos a registrar hoy en Foco?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accesosRapidos.map((item, index) => (
          <Link key={index} href={item.link}>
            <div className={`
              bg-white p-6 rounded-2xl border-2 border-transparent shadow-sm 
              transition-all duration-200 cursor-pointer flex items-center gap-5
              active:scale-95 ${item.color} hover:shadow-md
            `}>
              <div className="bg-slate-50 p-4 rounded-xl">
                {item.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">{item.titulo}</h2>
                <p className="text-slate-500 text-sm">{item.descripcion}</p>
              </div>
              <ArrowRight className="text-slate-300 w-5 h-5" />
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-12 p-6 bg-slate-900 rounded-2xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold">Estado del Sistema</h3>
            <p className="text-slate-400 text-sm">Conectado a la base de datos central</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/30">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Online
          </div>
        </div>
      </footer>
    </div>
  );
}
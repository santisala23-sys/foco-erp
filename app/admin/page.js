'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseClient } from '../lib/db';
import { Users, ShieldCheck, Package, ClipboardList, UserPlus, Bell, UserSearch } from 'lucide-react';
export default function AdminPanel() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [stats, setStats] = useState({ socios: 0, profes: 0, materiales: 0, pendientes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function inicializarAdmin() {
      // 1. Verificación de seguridad
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: perfil } = await supabaseClient
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (perfil?.rol !== 'admin') {
        alert("Acceso denegado. Solo administradores.");
        router.push('/');
        return;
      }

      setAutorizado(true);

      // 2. Carga de estadísticas
      const { count: sociosCount } = await supabaseClient
        .from('socios')
        .select('*', { count: 'exact', head: true });

      const { count: profesCount } = await supabaseClient
        .from('perfiles')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'profe');

      const { count: stockBajo } = await supabaseClient
        .from('materiales')
        .select('*', { count: 'exact', head: true })
        .lt('cantidad', 5);

// ... dentro de fetchStats()
// 4. Contar Solicitudes de Socios Pendientes
const { count: solicitudesPendientes } = await supabaseClient
  .from('socios')
  .select('*', { count: 'exact', head: true })
  .eq('estado', 'pendiente');

setStats(prev => ({
  ...prev,
  pendientesSocios: solicitudesPendientes || 0
}));
// ...


      // 3. Contar pedidos pendientes de aprobación
      const { count: pedidosPendientes } = await supabaseClient
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

      setStats({
        socios: sociosCount || 0,
        profes: profesCount || 0,
        materiales: stockBajo || 0,
        pendientes: pedidosPendientes || 0
      });
      setLoading(false);
    }
    
    inicializarAdmin();
  }, [router]);

  const menuAdmin = [
  { 
    title: 'Aprobaciones de Socios', 
    icon: <UserSearch className={stats.pendientesSocios > 0 ? "text-orange-400 animate-pulse" : ""} />, 
    desc: `Hay ${stats.pendientesSocios} solicitudes nuevas`, 
    link: '/admin/aprobaciones' 
  },
  { title: 'Gestión de Profesores', icon: <ShieldCheck />, desc: 'Asignar divisiones y crear cuentas', link: '/admin/profes' },
  { title: 'Inventario Global', icon: <Package />, desc: 'Control de stock y compras', link: '/materiales' },
  { title: 'Reportes de Asistencia', icon: <ClipboardList />, desc: 'Ver quién faltó a cada clase', link: '/dashboards' },
];
  if (!autorizado) return <div className="p-10 text-center">Verificando credenciales de Admin...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
          <p className="text-slate-500">Control total de Foco ERP</p>
        </div>
      </header>

      {/* Tarjetas de Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-sm font-medium">Socios</span>
          <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '...' : stats.socios}</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-sm font-medium">Profesores</span>
          <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '...' : stats.profes}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-sm font-medium">Stock Bajo</span>
          <p className="text-3xl font-bold text-red-600 mt-1">{loading ? '...' : stats.materiales}</p>
        </div>

        <div className={`p-5 rounded-2xl shadow-sm border transition-colors ${stats.pendientes > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
          <span className="text-slate-500 text-sm font-medium">Pedidos Pendientes</span>
          <p className={`text-3xl font-bold mt-1 ${stats.pendientes > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {loading ? '...' : stats.pendientes}
          </p>
        </div>
      </div>

      {/* Accesos a Gestiones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuAdmin.map((item, idx) => (
          <Link key={idx} href={item.link}>
            <div className="flex items-center p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="p-3 bg-slate-900 text-white rounded-xl mr-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-6 bg-blue-600 rounded-3xl text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg shadow-blue-200">
        <div>
          <h2 className="font-bold text-xl">Gestión de Staff</h2>
          <p className="text-blue-100 text-sm mt-1">Registrá nuevos profesores para que accedan al sistema con su propia cuenta.</p>
        </div>
        <Link href="/admin/nuevo-profe">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all active:scale-95 whitespace-nowrap">
            <UserPlus size={20} /> Crear Cuenta Profe
          </button>
        </Link>
      </div>
    </div>
  );
}
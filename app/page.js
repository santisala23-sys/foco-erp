import { supabase } from './lib/supabase'

export const revalidate = 0;

export default async function Home() {
  const { data: actividades } = await supabase.from('actividades').select('*')

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Bienvenido a Foco</h1>
        <p className="text-slate-500 mt-1">Tu resumen operativo del día.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
          <h3 className="text-slate-500 text-sm font-medium">Estado del Sistema</h3>
          <p className="text-2xl font-bold text-slate-800 mt-2">En línea</p>
          <p className="text-sm text-emerald-600 font-medium mt-1">
            {actividades ? `Base de datos conectada` : 'Verificando...'}
          </p>
        </div>
        
        {/* Acá luego agregaremos tarjetas reales con cantidad de socios, etc. */}
      </div>
    </div>
  )
}
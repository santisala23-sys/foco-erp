'use client'

import { useState, useEffect } from 'react'
import { supabaseClient as supabase } from '../../lib/db'
import { Check, X, UserClock, ShieldAlert, Phone, AlertCircle } from 'lucide-react'

export default function DashboardAprobaciones() {
  const [pendientes, setPendientes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetchPendientes()
  }, [])

  async function fetchPendientes() {
    const { data, error } = await supabase
      .from('socios')
      .select('*')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })

    if (!error) setPendientes(data)
    setCargando(false)
  }

  async function gestionarSocio(id, nuevoEstado) {
    const { error } = await supabase
      .from('socios')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (!error) {
      // Filtramos el socio de la lista actual para que desaparezca visualmente
      setPendientes(prev => prev.filter(s => s.id !== id))
    }
  }

  if (cargando) return <div className="p-10 text-center text-slate-500">Buscando solicitudes...</div>

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <UserClock className="text-orange-500" size={32} />
          Solicitudes de Ingreso
        </h1>
        <p className="text-slate-500">Aprobá o rechazá a los nuevos socios que se registraron online.</p>
      </header>

      {pendientes.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-400 font-medium text-lg">No hay solicitudes pendientes por ahora.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendientes.map((socio) => (
            <div key={socio.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-800">{socio.nombre} {socio.apellido}</h3>
                  {socio.es_menor && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Menor
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
                  <p className="flex items-center gap-1"><strong>DNI:</strong> {socio.dni}</p>
                  <p className="flex items-center gap-1"><strong>Emergencia:</strong> {socio.telefono_emergencia} ({socio.contacto_emergencia})</p>
                  <p className="md:col-span-2 text-slate-500 italic">
                    <strong>Alergias:</strong> {socio.alergias || 'Ninguna declarada'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                <button 
                  onClick={() => gestionarSocio(socio.id, 'rechazado')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                >
                  <X size={18} /> Rechazar
                </button>
                <button 
                  onClick={() => gestionarSocio(socio.id, 'aprobado')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-all font-semibold shadow-sm"
                >
                  <Check size={18} /> Aprobar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
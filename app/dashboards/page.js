"use client"

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart3, TrendingUp, Users, AlertCircle } from 'lucide-react'

export default function DashboardGeneral() {
  const [estadisticas, setEstadisticas] = useState({
    totalEntrenamientos: 0,
    promedioPresentes: 0,
    totalAusencias: 0,
    ultimosRegistros: []
  })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarMeticas() {
      try {
        // 1. Traemos todas las asistencias con los datos cruzados (JOINs) de entrenamientos y socios
        const { data: asistencias, error } = await supabase
          .from('asistencias')
          .select(`
            estado,
            entrenamientos ( fecha, categoria_id ),
            socios ( nombre, apellido )
          `)
          .order('created_at', { ascending: false })

        if (asistencias) {
          const presentes = asistencias.filter(a => a.estado === 'Presente').length
          const ausentes = asistencias.filter(a => a.estado === 'Ausente').length
          const total = asistencias.length
          
          // Calculamos métricas
          const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0
          
          // Agrupamos para contar entrenamientos únicos por fecha
          const fechasUnicas = new Set(asistencias.map(a => a.entrenamientos?.fecha)).size

          setEstadisticas({
            totalEntrenamientos: fechasUnicas,
            promedioPresentes: porcentaje,
            totalAusencias: ausentes,
            ultimosRegistros: asistencias.slice(0, 5) // Últimos 5 registros para la tabla
          })
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error)
      } finally {
        setCargando(false)
      }
    }

    cargarMeticas()
  }, [])

  if (cargando) return <div className="p-8 text-slate-500">Analizando datos...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto w-full pb-24">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Panel de Análisis</h1>
        <p className="text-slate-500 mt-1">Visualización de métricas generales del club.</p>
      </header>

      {/* Tarjetas de KPIs (Key Performance Indicators) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* KPI 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Entrenamientos Realizados</p>
              <h3 className="text-3xl font-bold text-slate-800">{estadisticas.totalEntrenamientos}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Sesiones registradas en el sistema</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Tasa de Asistencia</p>
              <h3 className="text-3xl font-bold text-slate-800">{estadisticas.promedioPresentes}%</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
          </div>
          {/* Pequeña barra de progreso visual */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${estadisticas.promedioPresentes}%` }}></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Ausencias Acumuladas</p>
              <h3 className="text-3xl font-bold text-slate-800">{estadisticas.totalAusencias}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Jugadores marcados como Ausente</p>
        </div>

      </div>

      {/* Tabla de Últimos Movimientos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <Users size={20} className="text-blue-500" />
            Últimos Registros Procesados
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200 text-sm text-slate-500">
              <th className="p-4 font-medium">Jugador</th>
              <th className="p-4 font-medium">Fecha</th>
              <th className="p-4 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {estadisticas.ultimosRegistros.map((registro, idx) => (
              <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="p-4 font-medium text-slate-700">
                  {registro.socios?.apellido}, {registro.socios?.nombre}
                </td>
                <td className="p-4 text-slate-500">
                  {registro.entrenamientos?.fecha ? new Date(registro.entrenamientos.fecha).toLocaleDateString('es-AR') : '-'}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                    registro.estado === 'Presente' ? 'bg-emerald-100 text-emerald-700' :
                    registro.estado === 'Ausente' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {registro.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
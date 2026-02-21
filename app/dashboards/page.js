'use client'

import { useState, useEffect } from 'react'
import { supabaseClient as supabase } from '../lib/db' // Ruta relativa segura
import { BarChart3, Users, Trophy, Target, Activity, Swords, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function Dashboards() {
  const [cargando, setCargando] = useState(true)
  const [stats, setStats] = useState({
    totalJugadores: 0,
    asistenciaPromedio: 0,
    golesFavor: 0,
    victorias: 0,
    empates: 0,
    derrotas: 0
  })
  const [ultimosPartidos, setUltimosPartidos] = useState([])

  useEffect(() => {
    async function cargarMetricas() {
      setCargando(true)
      try {
        // 1. Jugadores Activos
        const { count: totalSocios } = await supabase
          .from('socios')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'aprobado')

        // 2. Asistencia Histórica
        const { data: asistencias } = await supabase.from('asistencias').select('estado')
        let porcentajeAsistencia = 0
        if (asistencias && asistencias.length > 0) {
          const presentes = asistencias.filter(a => a.estado === 'Presente').length
          porcentajeAsistencia = Math.round((presentes / asistencias.length) * 100)
        }

        // 3. Partidos y Rendimiento
        const { data: partidos } = await supabase
          .from('partidos')
          .select('*')
          .order('fecha', { ascending: false })

        let gf = 0, v = 0, e = 0, d = 0
        let ultimos = []

        if (partidos && partidos.length > 0) {
          ultimos = partidos.slice(0, 5) // Agarramos los 5 más recientes para la lista
          
          partidos.forEach(p => {
            gf += p.goles_favor || 0
            if (p.goles_favor > p.goles_contra) v++
            else if (p.goles_favor < p.goles_contra) d++
            else e++
          })
        }

        setStats({
          totalJugadores: totalSocios || 0,
          asistenciaPromedio: porcentajeAsistencia,
          golesFavor: gf,
          victorias: v,
          empates: e,
          derrotas: d
        })
        setUltimosPartidos(ultimos)

      } catch (error) {
        console.error("Error cargando métricas:", error)
      } finally {
        setCargando(false)
      }
    }

    cargarMetricas()
  }, [])

  if (cargando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">Procesando millones de datos... (o casi)</p>
      </div>
    )
  }

  const totalPartidosJugados = stats.victorias + stats.empates + stats.derrotas;
  const winrate = totalPartidosJugados > 0 ? Math.round((stats.victorias / totalPartidosJugados) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pb-32">
      <header className="mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="text-purple-400" size={32} />
          Estadísticas y Rendimiento
        </h1>
        <p className="text-slate-300 mt-1">Métricas globales y últimos resultados del club.</p>
      </header>

      {/* 1. TARJETAS DE KPIs (Métricas Clave) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <Users size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Plantel Activo</p>
            <p className="text-3xl font-black text-slate-900">{stats.totalJugadores} <span className="text-lg font-medium text-slate-400">jugadores</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600">
            <Activity size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Asistencia Promedio</p>
            <p className="text-3xl font-black text-slate-900">{stats.asistenciaPromedio}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-amber-100 p-4 rounded-xl text-amber-600">
            <Target size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Goles a Favor</p>
            <p className="text-3xl font-black text-slate-900">{stats.golesFavor} <span className="text-lg font-medium text-slate-400">en total</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. ÚLTIMOS RESULTADOS (Ocupa 2/3 del ancho) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-800 overflow-hidden">
          <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center gap-2">
            <Swords size={20} className="text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">Últimos Resultados</h2>
          </div>
          
          <div className="divide-y divide-slate-100">
            {ultimosPartidos.length === 0 ? (
              <p className="p-8 text-center text-slate-500">Todavía no hay partidos registrados.</p>
            ) : (
              ultimosPartidos.map(partido => {
                const esVictoria = partido.goles_favor > partido.goles_contra;
                const esEmpate = partido.goles_favor === partido.goles_contra;
                const esDerrota = partido.goles_favor < partido.goles_contra;
                
                return (
                  <div key={partido.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                          ${esVictoria ? 'bg-emerald-100 text-emerald-700' : esEmpate ? 'bg-slate-200 text-slate-600' : 'bg-red-100 text-red-700'}
                        `}>
                          {esVictoria ? 'Victoria' : esEmpate ? 'Empate' : 'Derrota'}
                        </span>
                        <span className="text-sm font-medium text-slate-400">
                          {new Date(partido.fecha).toLocaleDateString('es-AR')} • {partido.condicion}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Foco vs {partido.rival}</h3>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                      <div className="text-center">
                        <span className="block text-xs font-bold text-slate-400 uppercase">Foco</span>
                        <span className={`text-2xl font-black ${esVictoria ? 'text-emerald-600' : 'text-slate-700'}`}>{partido.goles_favor}</span>
                      </div>
                      <span className="text-slate-300 font-bold">-</span>
                      <div className="text-center">
                        <span className="block text-xs font-bold text-slate-400 uppercase">Rival</span>
                        <span className={`text-2xl font-black ${esDerrota ? 'text-red-600' : 'text-slate-700'}`}>{partido.goles_contra}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* 3. RESUMEN DE TEMPORADA (Ocupa 1/3 del ancho) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-800 p-6 h-fit sticky top-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Trophy size={20} className="text-amber-500" />
            Balance de Temporada
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-500">Tasa de Victorias</span>
                <span className="text-2xl font-black text-emerald-500">{winrate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${winrate}%` }}></div>
                <div className="bg-slate-300 h-full" style={{ width: `${totalPartidosJugados > 0 ? Math.round((stats.empates / totalPartidosJugados) * 100) : 0}%` }}></div>
                <div className="bg-red-500 h-full" style={{ width: `${totalPartidosJugados > 0 ? Math.round((stats.derrotas / totalPartidosJugados) * 100) : 0}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-100">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <TrendingUp size={20} className="mx-auto text-emerald-600 mb-1" />
                <span className="block text-2xl font-black text-emerald-700">{stats.victorias}</span>
                <span className="text-xs font-bold text-emerald-600 uppercase">Ganados</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <Minus size={20} className="mx-auto text-slate-500 mb-1" />
                <span className="block text-2xl font-black text-slate-700">{stats.empates}</span>
                <span className="text-xs font-bold text-slate-500 uppercase">Empates</span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <TrendingDown size={20} className="mx-auto text-red-600 mb-1" />
                <span className="block text-2xl font-black text-red-700">{stats.derrotas}</span>
                <span className="text-xs font-bold text-red-600 uppercase">Perdidos</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
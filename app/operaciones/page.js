"use client"

import { useState, useEffect } from 'react'
import { supabaseClient as supabase } from '../lib/db'
import { Users, Save, Calendar, Trophy, Swords, Target } from 'lucide-react'

export default function OperacionesCenter() {
  const [vistaActiva, setVistaActiva] = useState('asistencia') 

  const [actividades, setActividades] = useState([])
  const [categorias, setCategorias] = useState([])
  const [divisiones, setDivisiones] = useState([])
  
  const [actividadId, setActividadId] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [divisionId, setDivisionId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  
  const [jugadores, setJugadores] = useState([])
  const [guardando, setGuardando] = useState(false)

  const [asistencias, setAsistencias] = useState({}) 
  const [datosPartido, setDatosPartido] = useState({ rival: '', condicion: 'Local', goles_favor: 0, goles_contra: 0 })
  const [rendimiento, setRendimiento] = useState({}) 

  useEffect(() => {
    async function fetchActividades() {
      const { data } = await supabase.from('actividades').select('*')
      if (data) setActividades(data)
    }
    fetchActividades()
  }, [])

  useEffect(() => {
    async function fetchCategorias() {
      if (!actividadId) return setCategorias([])
      const { data } = await supabase.from('categorias').select('*').eq('actividad_id', actividadId)
      if (data) setCategorias(data)
    }
    fetchCategorias()
  }, [actividadId])

  useEffect(() => {
    async function fetchDivisiones() {
      if (!categoriaId) return setDivisiones([])
      const { data } = await supabase.from('divisiones').select('*').eq('categoria_id', categoriaId)
      if (data) setDivisiones(data)
    }
    fetchDivisiones()
  }, [categoriaId])

  async function cargarJugadores() {
    const { data } = await supabase.from('socios').select('*').order('apellido')
    if (data) {
      setJugadores(data)
      if (vistaActiva === 'asistencia') {
        const estadoAsistencia = {}
        data.forEach(j => estadoAsistencia[j.id] = 'Presente')
        setAsistencias(estadoAsistencia)
      } else {
        const estadoRendimiento = {}
        data.forEach(j => estadoRendimiento[j.id] = 0) 
        setRendimiento(estadoRendimiento)
      }
    }
  }

  async function guardarAsistenciaBD() {
    setGuardando(true)
    try {
      const { data: entrenamiento } = await supabase
        .from('entrenamientos')
        .insert([{ actividad_id: actividadId, categoria_id: categoriaId, division_id: divisionId, fecha }])
        .select().single()

      if (entrenamiento) {
        const registros = jugadores.map(j => ({
          entrenamiento_id: entrenamiento.id, socio_id: j.id, estado: asistencias[j.id], comentarios: ''
        }))
        await supabase.from('asistencias').insert(registros)
        alert('¡Asistencia guardada con éxito!')
        setJugadores([]) 
      }
    } catch (error) {
      alert('Hubo un error al guardar.')
    } finally {
      setGuardando(false)
    }
  }

  async function guardarPartidoBD() {
    setGuardando(true)
    try {
      const { data: partido, error: errorPartido } = await supabase
        .from('partidos')
        .insert([{ 
          actividad_id: actividadId, categoria_id: categoriaId, division_id: divisionId, 
          fecha, rival: datosPartido.rival, condicion: datosPartido.condicion, 
          goles_favor: parseInt(datosPartido.goles_favor), goles_contra: parseInt(datosPartido.goles_contra)
        }])
        .select().single()

      if (errorPartido) throw errorPartido

      if (partido) {
        const registrosRendimiento = jugadores.map(j => ({
          partido_id: partido.id,
          socio_id: j.id,
          goles: parseInt(rendimiento[j.id] || 0)
        }))
        await supabase.from('rendimiento_jugadores').insert(registrosRendimiento)
        alert('¡Partido y rendimientos guardados con éxito!')
        setJugadores([])
        setDatosPartido({ rival: '', condicion: 'Local', goles_favor: 0, goles_contra: 0 })
      }
    } catch (error) {
      console.error(error)
      alert('Hubo un error al guardar el partido.')
    } finally {
      setGuardando(false)
    }
  }

  const handleTabChange = (tab) => {
    setVistaActiva(tab)
    setJugadores([])
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full pb-32">
      {/* 1. CAMBIO AQUÍ: text-white y text-slate-300 para contraste en fondo oscuro */}
      <header className="mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-white">Centro de Operaciones</h1>
        <p className="text-slate-300 mt-1">Gestioná los entrenamientos y los resultados de los partidos.</p>
      </header>

      {/* TABS (Ajustamos border color para modo oscuro) */}
      <div className="flex gap-4 mb-6 border-b border-slate-700 overflow-x-auto">
        <button onClick={() => handleTabChange('asistencia')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors whitespace-nowrap relative ${vistaActiva === 'asistencia' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <div className="flex items-center gap-2"><Calendar size={18} /> Toma de Asistencia</div>
          {vistaActiva === 'asistencia' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full"></div>}
        </button>
        <button onClick={() => handleTabChange('partidos')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors whitespace-nowrap relative ${vistaActiva === 'partidos' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <div className="flex items-center gap-2"><Trophy size={18} /> Registro de Partidos</div>
          {vistaActiva === 'partidos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 rounded-t-full"></div>}
        </button>
      </div>

      {/* FORMULARIO DE FILTROS */}
      {/* 2. CAMBIO AQUÍ: forzamos text-slate-800 en la caja blanca */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 text-slate-800">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900">
          <Users size={20} className={vistaActiva === 'asistencia' ? "text-blue-500" : "text-amber-500"} />
          1. Seleccionar Equipo y Fecha
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            {/* 3. CAMBIO AQUÍ: font-semibold text-slate-700 en los labels, y text-slate-900 en el select */}
            <label className="block text-sm font-semibold text-slate-700 mb-1">Actividad</label>
            <select className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              value={actividadId} onChange={(e) => { setActividadId(e.target.value); setCategoriaId(''); setDivisionId(''); setJugadores([]) }}>
              <option value="">Seleccionar...</option>
              {actividades.map(act => <option key={act.id} value={act.id}>{act.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
            <select className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              value={categoriaId} onChange={(e) => { setCategoriaId(e.target.value); setDivisionId(''); setJugadores([]) }} disabled={!actividadId}>
              <option value="">Seleccionar...</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">División</label>
            <select className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              value={divisionId} onChange={(e) => { setDivisionId(e.target.value); setJugadores([]) }} disabled={!categoriaId}>
              <option value="">Seleccionar...</option>
              {divisiones.map(div => <option key={div.id} value={div.id}>{div.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
            <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>

        {vistaActiva === 'partidos' && (
          <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1"><Swords size={16}/> Rival</label>
              <input type="text" placeholder="Ej: Club Atlético..." className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                value={datosPartido.rival} onChange={(e) => setDatosPartido({...datosPartido, rival: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Condición</label>
              <select className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                value={datosPartido.condicion} onChange={(e) => setDatosPartido({...datosPartido, condicion: e.target.value})}>
                <option value="Local">Local</option>
                <option value="Visitante">Visitante</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-sm font-bold text-emerald-700 mb-1 text-center">GF</label>
                <input type="number" min="0" className="w-full border border-emerald-300 rounded-lg p-2.5 bg-emerald-50 text-emerald-900 font-bold outline-none text-center focus:ring-2 focus:ring-emerald-500"
                  value={datosPartido.goles_favor} onChange={(e) => setDatosPartido({...datosPartido, goles_favor: e.target.value})} />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-bold text-red-700 mb-1 text-center">GC</label>
                <input type="number" min="0" className="w-full border border-red-300 rounded-lg p-2.5 bg-red-50 text-red-900 font-bold outline-none text-center focus:ring-2 focus:ring-red-500"
                  value={datosPartido.goles_contra} onChange={(e) => setDatosPartido({...datosPartido, goles_contra: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button 
            onClick={cargarJugadores} disabled={!divisionId || (vistaActiva === 'partidos' && !datosPartido.rival)}
            className={`${vistaActiva === 'asistencia' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'} text-white px-6 py-2.5 rounded-lg font-bold transition w-full md:w-auto disabled:opacity-50 shadow-md`}
          >
            Cargar Planilla de Jugadores
          </button>
        </div>
      </div>

      {/* TABLA DE JUGADORES */}
      {/* 4. CAMBIO AQUÍ: forzamos text-slate-800 en la caja de la tabla */}
      {jugadores.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative text-slate-800">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              {vistaActiva === 'asistencia' ? <Calendar size={20} className="text-emerald-500" /> : <Target size={20} className="text-amber-500" />}
              {vistaActiva === 'asistencia' ? '2. Registrar Asistencia' : '2. Rendimiento Individual'}
            </h2>
          </div>
          
          <div className="overflow-x-auto pb-20">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-sm text-slate-600">
                  <th className="p-4 font-bold">Jugador</th>
                  <th className="p-4 font-bold text-center">{vistaActiva === 'asistencia' ? 'Estado' : 'Goles Marcados'}</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((jugador) => (
                  <tr key={jugador.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-4 font-semibold text-slate-900">{jugador.apellido}, {jugador.nombre}</td>
                    <td className="p-4 flex justify-center">
                      
                      {vistaActiva === 'asistencia' && (
                        <div className="flex gap-2">
                          {['Presente', 'Ausente', 'Justificado'].map((estado) => (
                            <button key={estado} onClick={() => setAsistencias({ ...asistencias, [jugador.id]: estado })}
                              className={`px-3 py-1.5 text-sm rounded-md font-bold transition ${
                                asistencias[jugador.id] === estado 
                                  ? estado === 'Presente' ? 'bg-emerald-100 text-emerald-800 border border-emerald-400' : estado === 'Ausente' ? 'bg-red-100 text-red-800 border border-red-400' : 'bg-amber-100 text-amber-800 border border-amber-400'
                                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {estado}
                            </button>
                          ))}
                        </div>
                      )}

                      {vistaActiva === 'partidos' && (
                        <div className="flex items-center gap-3">
                          <button onClick={() => setRendimiento({...rendimiento, [jugador.id]: Math.max(0, rendimiento[jugador.id] - 1)})} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-800">-</button>
                          <span className="text-xl font-bold w-6 text-center text-slate-900">{rendimiento[jugador.id]}</span>
                          <button onClick={() => setRendimiento({...rendimiento, [jugador.id]: rendimiento[jugador.id] + 1})} className="w-8 h-8 rounded-full bg-amber-200 hover:bg-amber-300 flex items-center justify-center font-bold text-amber-900">+</button>
                        </div>
                      )}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOTÓN FLOTANTE DEFINITIVO */}
          <div className="fixed bottom-6 right-6 md:right-10 z-[100]">
            <button 
              onClick={vistaActiva === 'asistencia' ? guardarAsistenciaBD : guardarPartidoBD}
              disabled={guardando}
              className={`
                flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white shadow-2xl 
                transform transition hover:scale-105 active:scale-95 disabled:opacity-50
                ${vistaActiva === 'asistencia' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}
              `}
            >
              <Save size={24} />
              <span className="text-lg">
                {guardando ? 'Guardando...' : `Guardar ${vistaActiva === 'asistencia' ? 'Asistencia' : 'Partido'}`}
              </span>
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
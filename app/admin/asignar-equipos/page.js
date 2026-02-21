'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient as supabase } from '../../lib/db'
import { Users, Save, CheckSquare, Square, ArrowRight, Activity } from 'lucide-react'

export default function AsignarEquipos() {
  const router = useRouter()
  const [autorizado, setAutorizado] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [jugadoresSinEquipo, setJugadoresSinEquipo] = useState([])
  const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState([])

  const [actividades, setActividades] = useState([])
  const [categorias, setCategorias] = useState([])
  const [divisiones, setDivisiones] = useState([])

  const [actividadId, setActividadId] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [divisionId, setDivisionId] = useState('')

  // 1. Verificamos que sea ADMIN
  useEffect(() => {
    async function chequearPermisos() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
      if (perfil?.rol?.trim().toLowerCase() !== 'admin') {
        router.push('/')
      } else {
        setAutorizado(true)
        cargarDatosBase()
      }
    }
    chequearPermisos()
  }, [router])

  // 2. Cargamos Actividades y Jugadores "Aprobados pero sin División"
  async function cargarDatosBase() {
    const { data: acts } = await supabase.from('actividades').select('*')
    if (acts) setActividades(acts)

    const { data: sinEquipo } = await supabase
      .from('socios')
      .select('*')
      .eq('estado', 'aprobado')
      .is('division_id', null) // La clave: buscamos a los que no tienen equipo
      .order('apellido')
    
    if (sinEquipo) setJugadoresSinEquipo(sinEquipo)
  }

  // 3. Efectos en Cascada para los Selects
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

  // 4. Manejo de Checkboxes
  const toggleJugador = (id) => {
    if (jugadoresSeleccionados.includes(id)) {
      setJugadoresSeleccionados(jugadoresSeleccionados.filter(jId => jId !== id))
    } else {
      setJugadoresSeleccionados([...jugadoresSeleccionados, id])
    }
  }

  const seleccionarTodos = () => {
    if (jugadoresSeleccionados.length === jugadoresSinEquipo.length) {
      setJugadoresSeleccionados([])
    } else {
      setJugadoresSeleccionados(jugadoresSinEquipo.map(j => j.id))
    }
  }

  // 5. Guardar Asignaciones
  const handleAsignar = async () => {
    if (!divisionId) return alert("Por favor, seleccioná una división destino primero.")
    if (jugadoresSeleccionados.length === 0) return alert("Seleccioná al menos un jugador.")

    setGuardando(true)
    try {
      // Actualizamos masivamente a los jugadores seleccionados
      const { error } = await supabase
        .from('socios')
        .update({ division_id: divisionId })
        .in('id', jugadoresSeleccionados)

      if (error) throw error

      alert(`¡${jugadoresSeleccionados.length} jugadores asignados con éxito!`)
      
      // Limpiamos la pantalla
      setJugadoresSeleccionados([])
      cargarDatosBase() // Recargamos para que desaparezcan de esta lista
      
    } catch (error) {
      alert("Error al asignar: " + error.message)
    } finally {
      setGuardando(false)
    }
  }

  if (!autorizado) return <div className="p-10 text-center text-slate-500">Verificando credenciales...</div>

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full pb-32">
      <header className="mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="text-blue-500" size={32} />
          Asignación de Equipos
        </h1>
        <p className="text-slate-300 mt-1">Elegí a los jugadores recién aprobados y ubicalos en su categoría.</p>
      </header>

      {jugadoresSinEquipo.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm text-slate-800">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-700">¡Todo al día!</h2>
          <p className="text-slate-500 mt-2">No hay jugadores aprobados pendientes de asignación de equipo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMNA 1: LISTA DE JUGADORES (2/3 del espacio) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-slate-800">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-slate-500" />
                Jugadores Sin Equipo ({jugadoresSinEquipo.length})
              </h2>
              <button onClick={seleccionarTodos} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                {jugadoresSeleccionados.length === jugadoresSinEquipo.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
              </button>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {jugadoresSinEquipo.map(jugador => (
                <div 
                  key={jugador.id} 
                  onClick={() => toggleJugador(jugador.id)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${jugadoresSeleccionados.includes(jugador.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                >
                  <div className="text-blue-600">
                    {jugadoresSeleccionados.includes(jugador.id) ? <CheckSquare size={24} /> : <Square size={24} className="text-slate-300" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{jugador.apellido}, {jugador.nombre}</h3>
                    <p className="text-sm text-slate-500">DNI: {jugador.dni} • {jugador.es_menor ? 'Menor de Edad' : 'Mayor de Edad'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA 2: SELECTOR DE DESTINO (1/3 del espacio) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit text-slate-800 sticky top-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <ArrowRight size={20} className="text-blue-500" />
              Destino
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Actividad</label>
                <select className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  value={actividadId} onChange={(e) => { setActividadId(e.target.value); setCategoriaId(''); setDivisionId('') }}>
                  <option value="">Seleccionar...</option>
                  {actividades.map(act => <option key={act.id} value={act.id}>{act.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
                <select className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  value={categoriaId} onChange={(e) => { setCategoriaId(e.target.value); setDivisionId('') }} disabled={!actividadId}>
                  <option value="">Seleccionar...</option>
                  {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">División *</label>
                <select className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  value={divisionId} onChange={(e) => setDivisionId(e.target.value)} disabled={!categoriaId}>
                  <option value="">Seleccionar...</option>
                  {divisiones.map(div => <option key={div.id} value={div.id}>{div.nombre}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={handleAsignar}
              disabled={guardando || !divisionId || jugadoresSeleccionados.length === 0}
              className="w-full mt-8 bg-blue-600 text-white px-6 py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md active:scale-95"
            >
              <Save size={20} />
              {guardando ? 'Asignando...' : `Asignar ${jugadoresSeleccionados.length} jugadores`}
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
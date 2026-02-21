'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient as supabase } from '../lib/db'
import { UserPlus, Save, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function AltaSocios() {
  const router = useRouter()
  const [autorizado, setAutorizado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [estado, setEstado] = useState({ tipo: '', mensaje: '' })

  // Estado para el formulario
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    genero: '',
    obra_social: '',
    numero_afiliado: '',
    alergias: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    es_menor: false
  })

  // 1. Verificación de Seguridad (Solo Admin)
  useEffect(() => {
    async function chequearPermisos() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single()

      if (perfil?.rol !== 'admin') {
        alert("Acceso denegado. Solo administración puede cargar socios directamente.")
        router.push('/')
      } else {
        setAutorizado(true)
      }
    }
    chequearPermisos()
  }, [router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // 2. Envío de datos a Supabase
  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setEstado({ tipo: '', mensaje: '' })

    try {
      // Al ser cargado por Admin, el socio nace 'aprobado'
      const { error } = await supabase
        .from('socios')
        .insert([{ 
          ...formData, 
          estado: 'aprobado', 
          fuente: 'admin' 
        }])

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ya existe un socio registrado con este DNI.')
        }
        throw error
      }

      setEstado({ tipo: 'exito', mensaje: 'Socio registrado y aprobado correctamente.' })
      
      // Limpiar formulario
      setFormData({
        dni: '', nombre: '', apellido: '', fecha_nacimiento: '', genero: '',
        obra_social: '', numero_afiliado: '', alergias: '',
        contacto_emergencia: '', telefono_emergencia: '', es_menor: false
      })
      
      setTimeout(() => setEstado({ tipo: '', mensaje: '' }), 3000)

    } catch (error) {
      setEstado({ tipo: 'error', mensaje: error.message || 'Error al guardar.' })
    } finally {
      setGuardando(false)
    }
  }

  if (!autorizado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Verificando credenciales de Admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pb-24">
      <header className="mb-8 border-b pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Carga de Socios</h1>
          <p className="text-slate-500 mt-1">Alta directa de jugadores (Modo Administrador)</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
          <ShieldCheck size={14} /> ADMIN MODE
        </div>
      </header>

      {estado.mensaje && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border ${
          estado.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {estado.tipo === 'exito' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-red-500" />}
          <p className="font-medium">{estado.mensaje}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN 1: Datos Personales */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2 border-b pb-2">
            <UserPlus size={20} className="text-blue-500" />
            Datos Personales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">DNI (Sin puntos) *</label>
              <input type="text" name="dni" required value={formData.dni} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre *</label>
                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Apellido *</label>
                <input type="text" name="apellido" required value={formData.apellido} onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Fecha de Nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Género</label>
              <select name="genero" value={formData.genero} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <input type="checkbox" id="es_menor" name="es_menor" checked={formData.es_menor} onChange={handleChange} 
                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="es_menor" className="text-sm font-medium text-slate-700 cursor-pointer">
                Socio menor de edad (requiere datos de tutor para emergencias)
              </label>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Datos Médicos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2 border-b pb-2">
            <AlertCircle size={20} className="text-emerald-500" />
            Salud y Emergencias
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Obra Social / Prepaga</label>
              <input type="text" name="obra_social" value={formData.obra_social} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Número de Afiliado</label>
              <input type="text" name="numero_afiliado" value={formData.numero_afiliado} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Alergias o Observaciones</label>
              <textarea name="alergias" rows="2" value={formData.alergias} onChange={handleChange} placeholder="Ej: Asma, alergia a medicamentos..."
                className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tutor / Emergencia (Nombre) *</label>
              <input type="text" name="contacto_emergencia" required value={formData.contacto_emergencia} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono Emergencia *</label>
              <input type="text" name="telefono_emergencia" required value={formData.telefono_emergencia} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={guardando}
            className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg active:scale-95"
          >
            <Save size={20} />
            {guardando ? 'Guardando...' : 'Registrar Socio'}
          </button>
        </div>
      </form>
    </div>
  )
}
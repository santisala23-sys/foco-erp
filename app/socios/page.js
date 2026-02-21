"use client"

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { UserPlus, Save, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function AltaSocios() {
  // Estado para guardar todos los datos del formulario
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

  const [estado, setEstado] = useState({ tipo: '', mensaje: '' }) // Para mostrar éxito o error
  const [guardando, setGuardando] = useState(false)

  // Función para actualizar el estado cuando el usuario escribe
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Función para enviar los datos a Supabase
  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setEstado({ tipo: '', mensaje: '' })

    try {
      const { data, error } = await supabase
        .from('socios')
        .insert([formData])

      if (error) {
        if (error.code === '23505') { // Código de error de PostgreSQL para "DNI duplicado"
          throw new Error('Ya existe un socio registrado con este DNI.')
        }
        throw error
      }

      // Si salió todo bien, mostramos mensaje y limpiamos el formulario
      setEstado({ tipo: 'exito', mensaje: 'Socio registrado correctamente.' })
      setFormData({
        dni: '', nombre: '', apellido: '', fecha_nacimiento: '', genero: '',
        obra_social: '', numero_afiliado: '', alergias: '',
        contacto_emergencia: '', telefono_emergencia: '', es_menor: false
      })
      
      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => setEstado({ tipo: '', mensaje: '' }), 3000)

    } catch (error) {
      setEstado({ tipo: 'error', mensaje: error.message || 'Hubo un error al guardar los datos.' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full pb-24">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Portal de Socios</h1>
        <p className="text-slate-500 mt-1">Registrá un nuevo jugador en la base de datos del club.</p>
      </header>

      {/* Alertas de Éxito o Error */}
      {estado.mensaje && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          estado.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {estado.tipo === 'exito' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-red-500" />}
          <p className="font-medium">{estado.mensaje}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECCIÓN 1: Datos Personales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2 border-b pb-2">
            <UserPlus size={20} className="text-blue-500" />
            Datos Personales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">DNI (Sin puntos) *</label>
              <input type="text" name="dni" required value={formData.dni} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre(s) *</label>
                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Apellido(s) *</label>
                <input type="text" name="apellido" required value={formData.apellido} onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Fecha de Nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Género</label>
              <select name="genero" value={formData.genero} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <input type="checkbox" id="es_menor" name="es_menor" checked={formData.es_menor} onChange={handleChange} 
                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
              <label htmlFor="es_menor" className="text-sm font-medium text-slate-700">
                Marcar si el socio es menor de edad (requiere datos de tutor en contacto)
              </label>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Datos Médicos y Contacto */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2 border-b pb-2">
            <AlertCircle size={20} className="text-emerald-500" />
            Datos Médicos y Emergencias
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Obra Social / Prepaga</label>
              <input type="text" name="obra_social" value={formData.obra_social} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Número de Afiliado</label>
              <input type="text" name="numero_afiliado" value={formData.numero_afiliado} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Alergias o Condiciones a Mencionar</label>
              <textarea name="alergias" rows="2" value={formData.alergias} onChange={handleChange} placeholder="Ej: Asma, alergia a la penicilina..."
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Contacto de Emergencia (Nombre) *</label>
              <input type="text" name="contacto_emergencia" required value={formData.contacto_emergencia} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono de Emergencia *</label>
              <input type="text" name="telefono_emergencia" required value={formData.telefono_emergencia} onChange={handleChange} 
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Botón de Submit */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={guardando}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            <Save size={20} />
            {guardando ? 'Registrando...' : 'Registrar Socio'}
          </button>
        </div>
      </form>
    </div>
  )
}
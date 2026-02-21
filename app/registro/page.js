'use client'

import { useState } from 'react'
import { supabaseClient as supabase } from '../lib/db' // Usamos la ruta segura
import { UserPlus, Send, AlertCircle, CheckCircle2, Activity, HeartPulse } from 'lucide-react'

export default function RegistroPublico() {
  const [guardando, setGuardando] = useState(false)
  const [enviado, setEnviado] = useState(false) // Para mostrar la pantalla de éxito
  const [errorMsj, setErrorMsj] = useState('')

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrorMsj('')

    try {
      // Magia pura: Lo guardamos como 'pendiente' para que el Admin lo revise
      const { error } = await supabase
        .from('socios')
        .insert([{ 
          ...formData, 
          estado: 'pendiente', 
          fuente: 'publico' 
        }])

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ya existe una solicitud registrada con este DNI en el club.')
        }
        throw error
      }

      // Si salió bien, mostramos la pantalla de éxito
      setEnviado(true)

    } catch (error) {
      setErrorMsj(error.message || 'Hubo un error al enviar el formulario. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  // PANTALLA DE ÉXITO (Lo que ve el padre después de enviar)
  if (enviado) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 flex flex-col items-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">¡Solicitud Enviada!</h1>
          <p className="text-slate-600 mb-8">
            Los datos de <strong>{formData.nombre}</strong> fueron recibidos correctamente. La administración del club revisará la información y se pondrá en contacto a la brevedad.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-emerald-600 font-bold hover:text-emerald-700 transition"
          >
            Inscribir a otro jugador
          </button>
        </div>
      </div>
    )
  }

  // EL FORMULARIO PÚBLICO
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-0">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* ENCABEZADO DE MARCA */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4 shadow-lg">
            <Activity size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">FOCO Club</h1>
          <p className="text-slate-500 mt-2 font-medium">Formulario de Pre-Inscripción de Jugadores</p>
        </div>

        {errorMsj && (
          <div className="p-4 rounded-xl mb-6 bg-red-50 text-red-800 border border-red-200 flex items-center gap-3 shadow-sm">
            <AlertCircle size={24} className="text-red-500 shrink-0" />
            <p className="font-medium text-sm">{errorMsj}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN 1: Datos Personales */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <UserPlus size={24} className="text-blue-500" />
              Datos del Jugador
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">DNI (Sin puntos) *</label>
                <input type="text" name="dni" required value={formData.dni} onChange={handleChange} placeholder="Ej: 45123456"
                  className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombre *</label>
                  <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} 
                    className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Apellido *</label>
                  <input type="text" name="apellido" required value={formData.apellido} onChange={handleChange} 
                    className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Nacimiento *</label>
                <input type="date" name="fecha_nacimiento" required value={formData.fecha_nacimiento} onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Género</label>
                <select name="genero" required value={formData.genero} onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              <div className="md:col-span-2 flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <input type="checkbox" id="es_menor" name="es_menor" checked={formData.es_menor} onChange={handleChange} 
                  className="w-6 h-6 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
                <label htmlFor="es_menor" className="text-sm font-bold text-blue-900 cursor-pointer">
                  El jugador es menor de edad (Acepto compartir datos de contacto parental)
                </label>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Datos Médicos */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <HeartPulse size={24} className="text-rose-500" />
              Salud y Contacto de Emergencia
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Obra Social / Prepaga</label>
                <input type="text" name="obra_social" value={formData.obra_social} onChange={handleChange} placeholder="Ej: OSDE, Swiss Medical, Ninguna"
                  className="w-full border border-slate-300 rounded-xl p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Número de Afiliado</label>
                <input type="text" name="numero_afiliado" value={formData.numero_afiliado} onChange={handleChange
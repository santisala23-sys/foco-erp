"use client"

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Package, PlusCircle, ClipboardList, CheckCircle2, AlertCircle, ListTodo, CheckSquare, ShoppingCart } from 'lucide-react'

export default function GestionMateriales() {
  const [materiales, setMateriales] = useState([])
  const [profesores, setProfesores] = useState([])
  const [pedidosPendientes, setPedidosPendientes] = useState([])
  
  const [pedido, setPedido] = useState({
    material_id: '',
    profesor_id: '',
    fecha_pedido: new Date().toISOString().split('T')[0],
    cantidad: 1
  })

  const [estado, setEstado] = useState({ tipo: '', mensaje: '' })
  const [guardando, setGuardando] = useState(false)
  
  // Referencia para hacer scroll al formulario cuando tocan "Pedir"
  const formRef = useRef(null)

  useEffect(() => {
    async function cargarDatos() {
      const { data: dataMateriales } = await supabase.from('materiales').select('*').order('nombre')
      if (dataMateriales) setMateriales(dataMateriales)

      const { data: dataProfesores } = await supabase.from('profesores').select('*').order('nombre_completo')
      if (dataProfesores) setProfesores(dataProfesores)

      const { data: dataPendientes } = await supabase
        .from('solicitudes_materiales')
        .select(`
          id, cantidad, fecha_pedido, material_id,
          materiales ( nombre, codigo_material ),
          profesores ( nombre_completo )
        `)
        .eq('estado', 'Pendiente')
        .order('fecha_pedido', { ascending: true })
      if (dataPendientes) setPedidosPendientes(dataPendientes)
    }
    cargarDatos()
  }, [estado])

  const registrarPedido = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setEstado({ tipo: '', mensaje: '' })

    try {
      const materialSeleccionado = materiales.find(m => m.id.toString() === pedido.material_id)
      if (materialSeleccionado && parseInt(pedido.cantidad) > materialSeleccionado.stock_actual) {
        throw new Error(`¡No hay suficiente stock! Solo quedan ${materialSeleccionado.stock_actual} unidades.`)
      }

      const { error } = await supabase.from('solicitudes_materiales').insert([{
        material_id: pedido.material_id,
        profesor_id: pedido.profesor_id,
        fecha_pedido: pedido.fecha_pedido,
        cantidad: parseInt(pedido.cantidad),
        estado: 'Pendiente'
      }])

      if (error) throw error

      setEstado({ tipo: 'exito', mensaje: 'Pedido registrado con éxito. Esperando retiro en utilería.' })
      setPedido({ ...pedido, material_id: '', cantidad: 1 }) 
      setTimeout(() => setEstado({ tipo: '', mensaje: '' }), 4000)

    } catch (error) {
      setEstado({ tipo: 'error', mensaje: error.message || 'Error al procesar el pedido.' })
    } finally {
      setGuardando(false)
    }
  }

  const confirmarRetiro = async (idSolicitud, idMaterial, cantidadRetirada) => {
    setGuardando(true)
    setEstado({ tipo: '', mensaje: '' })

    try {
      const { data: matInfo } = await supabase.from('materiales').select('stock_actual').eq('id', idMaterial).single()
      const nuevoStock = matInfo.stock_actual - cantidadRetirada

      if (nuevoStock < 0) throw new Error('El stock no puede quedar en negativo.')

      await supabase.from('materiales').update({ stock_actual: nuevoStock }).eq('id', idMaterial)
      await supabase.from('solicitudes_materiales').update({ estado: 'Entregado' }).eq('id', idSolicitud)

      setEstado({ tipo: 'exito', mensaje: 'Retiro confirmado. Stock descontado.' })
      setTimeout(() => setEstado({ tipo: '', mensaje: '' }), 4000)
    } catch (error) {
      setEstado({ tipo: 'error', mensaje: error.message || 'Error al confirmar el retiro.' })
    } finally {
      setGuardando(false)
    }
  }

  // Función para cuando hacen clic en "Pedir" directo desde la tabla
  const seleccionarParaPedido = (idMaterial) => {
    setPedido({ ...pedido, material_id: idMaterial.toString() })
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-32">
      <header className="mb-10 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Materiales</h1>
        <p className="text-slate-500 mt-1">Control de inventario y solicitudes de utilería.</p>
      </header>

      {estado.mensaje && (
        <div className={`p-4 rounded-lg mb-8 flex items-center gap-3 animate-in fade-in ${
          estado.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {estado.tipo === 'exito' ? <CheckCircle2 size={24} className="text-emerald-500"/> : <AlertCircle size={24} className="text-red-500"/>}
          <p className="font-medium">{estado.mensaje}</p>
        </div>
      )}

      {/* BLOQUE SUPERIOR: Inventario y Formulario separados por un gap enorme (gap-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* MÓDULO 1: Inventario */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
          <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
              <Package size={22} className="text-blue-500" />
              Inventario Actual
            </h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-sm text-slate-500">
                <th className="p-4 font-medium">Material</th>
                <th className="p-4 font-medium text-center">Stock</th>
                <th className="p-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((mat) => (
                <tr key={mat.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="p-4 font-medium text-slate-700">
                    {mat.nombre} <br/>
                    <span className="text-xs text-slate-400 font-normal">{mat.codigo_material}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      mat.stock_actual > 5 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {mat.stock_actual}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => seleccionarParaPedido(mat.id)}
                      className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-100 transition"
                    >
                      <ShoppingCart size={16} />
                      Pedir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MÓDULO 2: Solicitud */}
        <div ref={formRef} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-xl font-semibold text-slate-700 mb-6 flex items-center gap-2 border-b pb-4">
            <ClipboardList size={22} className="text-amber-500" />
            Nueva Solicitud
          </h2>

          <form onSubmit={registrarPedido} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Profesor Solicitante</label>
              <select required className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                value={pedido.profesor_id} onChange={(e) => setPedido({...pedido, profesor_id: e.target.value})}>
                <option value="">Seleccionar profesor...</option>
                {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre_completo}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Material</label>
                <select required className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 outline-none"
                  value={pedido.material_id} onChange={(e) => setPedido({...pedido, material_id: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Cantidad</label>
                <input type="number" min="1" required className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 outline-none"
                  value={pedido.cantidad} onChange={(e) => setPedido({...pedido, cantidad: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Fecha para el uso</label>
              <input type="date" required className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 outline-none"
                value={pedido.fecha_pedido} onChange={(e) => setPedido({...pedido, fecha_pedido: e.target.value})} />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button type="submit" disabled={guardando} className="w-full bg-blue-600 text-white px-6 py-3.5 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 disabled:opacity-50 shadow-md">
                <PlusCircle size={20} />
                Confirmar Solicitud
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MÓDULO 3: Bandeja de Retiros (Bien separado abajo) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-12">
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <ListTodo size={22} className="text-purple-500" />
            Retiros Pendientes de Aprobación
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-sm text-slate-500">
                <th className="p-4 font-medium">Fecha de Uso</th>
                <th className="p-4 font-medium">Profesor</th>
                <th className="p-4 font-medium">Material Solicitado</th>
                <th className="p-4 font-medium text-center">Cant.</th>
                <th className="p-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pedidosPendientes.length > 0 ? (
                pedidosPendientes.map((pend) => (
                  <tr key={pend.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="p-4 text-slate-600 font-medium">
                      {new Date(pend.fecha_pedido).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                    </td>
                    <td className="p-4 text-slate-700">{pend.profesores?.nombre_completo}</td>
                    <td className="p-4 text-slate-700 font-medium">{pend.materiales?.nombre}</td>
                    <td className="p-4 text-center font-bold text-slate-800">{pend.cantidad}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => confirmarRetiro(pend.id, pend.material_id, pend.cantidad)}
                        disabled={guardando}
                        className="bg-emerald-100 text-emerald-700 border border-emerald-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-200 transition flex items-center gap-2 ml-auto disabled:opacity-50"
                      >
                        <CheckSquare size={16} />
                        Aprobar Retiro
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No hay pedidos pendientes. ¡Todo al día!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
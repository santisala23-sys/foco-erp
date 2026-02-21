'use client';
import { useState, useEffect } from 'react';
import { supabaseClient } from '../../lib/db';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function GestionPedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  async function fetchPedidos() {
    // Traemos los pedidos y el nombre del material relacionado
    const { data } = await supabaseClient
      .from('pedidos')
      .select('*, materiales(nombre, cantidad)')
      .eq('estado', 'pendiente');
    setPedidos(data || []);
  }

  async function aprobarPedido(pedido) {
    // 1. Restamos el stock en la tabla materiales
    const nuevoStock = pedido.materiales.cantidad - pedido.cantidad;
    
    await supabaseClient
      .from('materiales')
      .update({ cantidad: nuevoStock })
      .eq('id', pedido.material_id);

    // 2. Marcamos el pedido como entregado
    await supabaseClient
      .from('pedidos')
      .update({ estado: 'entregado', fecha_entrega: new Date() })
      .eq('id', pedido.id);

    fetchPedidos(); // Refrescar lista
    alert("Material entregado y stock actualizado.");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pedidos de Profesores</h1>
      <div className="space-y-4">
        {pedidos.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border shadow-sm flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800">{p.nombre_profe} pidió:</p>
              <p className="text-lg text-blue-600">{p.cantidad} x {p.materiales.nombre}</p>
              <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <Clock size={12} /> Pendiente desde: {new Date(p.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => aprobarPedido(p)}
                className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-colors"
                title="Marcar como entregado"
              >
                <CheckCircle size={20} />
              </button>
            </div>
          </div>
        ))}
        {pedidos.length === 0 && <p className="text-slate-500 text-center py-10">No hay pedidos pendientes por ahora. 🙌</p>}
      </div>
    </div>
  );
}
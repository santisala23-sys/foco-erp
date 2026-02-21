"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Users, Package, CalendarCheck, BarChart3, Settings, Home, Activity, Menu, X } from 'lucide-react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  // Funciones para abrir y cerrar
  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* 1. BARRA SUPERIOR MÓVIL (Solo se ve en celulares) */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-slate-900 text-white p-4 z-40 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Activity size={20} className="text-emerald-400" /> FOCO ERP
        </div>
        <button onClick={toggleSidebar} className="p-1 focus:outline-none">
          <Menu size={28} />
        </button>
      </div>

      {/* 2. FONDO OSCURO (Cuando el menú está abierto en el celu) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        ></div>
      )}

      {/* 3. EL SIDEBAR REAL */}
      {/* Usamos md:static para escritorio, y fixed con translate para que se deslice en el celu */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Cabecera del Sidebar */}
        <div className="p-6 mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg text-white">
              <Activity size={24} />
            </div>
            FOCO
          </h2>
          {/* Botón de cerrar solo en móvil */}
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Links de Navegación (Le agregamos onClick={closeSidebar} para que se cierre al elegir uno) */}
        <nav className="flex-1 px-4 space-y-2 font-medium overflow-y-auto pb-4">
          <Link href="/" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <Home size={20} /> Inicio
          </Link>
          <Link href="/socios" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <Users size={20} /> Socios
          </Link>
          <Link href="/operaciones" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <CalendarCheck size={20} /> Operaciones
          </Link>
          <Link href="/materiales" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <Package size={20} /> Materiales
          </Link>
          <Link href="/dashboards" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <BarChart3 size={20} /> Dashboards
          </Link>
        </nav>

        {/* Configuración */}
        <div className="p-4 border-t border-slate-800 mt-auto">
          <Link href="/configuracion" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <Settings size={20} /> Panel de Control
          </Link>
        </div>
      </aside>
    </>
  )
}
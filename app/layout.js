import './globals.css'
import Sidebar from './components/Sidebar'

export const metadata = {
  title: 'Foco - ERP Deportivo',
  description: 'Sistema de gestión deportiva centralizado',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex bg-slate-50 min-h-screen font-sans">
        <Sidebar />
        
        {/* Agregamos pt-16 en móviles para que no se superponga con el menú, 
            y md:pt-0 para que en la compu siga normal */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto pt-16 md:pt-0">
          {children}
        </main>
      </body>
    </html>
  )
}
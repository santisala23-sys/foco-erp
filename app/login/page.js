'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // Definí acá la clave para los profes (ejemplo: "Foco2026")
    if (password === 'Foco2026') {
      localStorage.setItem('foco_auth', 'true');
      router.push('/');
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Acceso a Foco ERP</h1>
          <p className="text-slate-500 mt-2">Ingresá la clave de profesor para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Contraseña del sistema"
              className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-xl outline-none transition-all
                ${error ? 'border-red-400' : 'border-transparent focus:border-slate-900'}`}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-slate-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              Contraseña incorrecta. Intentá de nuevo.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors active:scale-95"
          >
            Entrar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
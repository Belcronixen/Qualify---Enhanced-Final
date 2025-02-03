import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { supabase } from '../../../lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (signInError) throw signInError;

      if (data.user?.user_metadata?.role !== 'admin') {
        throw new Error('Acceso no autorizado. Solo administradores pueden iniciar sesión.');
      }

      navigate('/admin');
    } catch (err) {
      console.error('Error de autenticación:', err);
      setError(err instanceof Error ? err.message : 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-neutral-900">
      {/* Particles Background */}
      <div className="absolute inset-0 z-0">
        {/* Add particles component here if needed */}
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md space-y-8 rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 shadow-xl backdrop-blur"
      >
        <div className="text-center">
          <img
            src="https://40125997.fs1.hubspotusercontent-na1.net/hubfs/40125997/Other%20projects/Untitled-2.png"
            alt="Logo"
            className="mx-auto h-16 w-auto"
          />
          <h2 className="mt-6 text-2xl font-bold text-white">
            Panel de Administración
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Inicia sesión para acceder al panel
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/20 p-4 text-sm text-red-400">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                Correo Electrónico
              </label>
              <Input
                id="email"
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="mt-1 border-neutral-800 bg-neutral-800 text-neutral-200 placeholder:text-neutral-500"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="mt-1 border-neutral-800 bg-neutral-800 text-neutral-200 placeholder:text-neutral-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

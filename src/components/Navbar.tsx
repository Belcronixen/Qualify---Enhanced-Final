import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, X, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const [showLoginModal, setShowLoginModal] = useState(false),
    [showMobileMenu, setShowMobileMenu] = useState(false),
    [error, setError] = useState(''),
    [isLoggedIn, setIsLoggedIn] = useState(false),
    [credentials, setCredentials] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (signInError) throw signInError;
      if (data.user?.user_metadata?.role !== 'admin') {
        setError('Acceso no autorizado. Solo administradores pueden iniciar sesión.');
        await supabase.auth.signOut();
        return;
      }
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setShowMobileMenu(false);
      localStorage.setItem('isAdminLoggedIn', 'true');
      navigate('/admin');
    } catch (err) {
      console.error('Error de autenticación:', err);
      setError('Credenciales inválidas. Por favor intente de nuevo.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setShowMobileMenu(false);
      localStorage.removeItem('isAdminLoggedIn');
      navigate('/');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(session?.user?.user_metadata?.role === 'admin');
    })();
  }, []);

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="https://40125997.fs1.hubspotusercontent-na1.net/hubfs/40125997/Other%20projects/Untitled-2.png"
              alt="Logo"
              className="h-8 w-auto sm:h-10 md:h-12"
            />
          </Link>
          <div className="hidden items-center space-x-4 md:flex">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link to="/admin">
                  <Button variant="outline">Panel de Admin</Button>
                </Link>
                <Button variant="ghost" className="flex items-center space-x-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" className="flex items-center space-x-2" onClick={() => setShowLoginModal(true)}>
                <LogIn className="h-4 w-4" />
                <span>Iniciar Sesión</span>
              </Button>
            )}
          </div>
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(!showMobileMenu)} className="relative">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        {showMobileMenu && (
          <div className="border-t border-neutral-200 bg-white px-4 py-2 md:hidden">
            {isLoggedIn ? (
              <div className="flex flex-col space-y-2">
                <Link to="/admin" onClick={() => setShowMobileMenu(false)}>
                  <Button variant="outline" className="w-full justify-start">Panel de Admin</Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setShowLoginModal(true);
                  setShowMobileMenu(false);
                }}
              >
                <LogIn className="mr-2 h-4 w-4" />Iniciar Sesión
              </Button>
            )}
          </div>
        )}
      </nav>
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Iniciar Sesión</h2>
              <button onClick={() => { setShowLoginModal(false); setError(''); }} className="text-neutral-500 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Correo Electrónico</label>
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">Contraseña</label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full">Iniciar Sesión</Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

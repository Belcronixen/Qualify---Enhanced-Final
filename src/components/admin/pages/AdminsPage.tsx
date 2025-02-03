import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X, AlertTriangle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { supabase } from '../../../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { loadAdmins(); }, []);

  async function loadAdmins() {
    try {
      const { data, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setAdmins(data || []);
    } catch (err) {
      console.error('Error loading admins:', err);
      setError('No tienes permisos para ver administradores.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: { data: { role: 'admin' } }
      });
      if (signUpError) throw signUpError;
      if (!user) throw new Error('No se pudo crear el usuario');
      const { error: updateError } = await supabase.auth.updateUser({ email_confirm: true });
      if (updateError) throw updateError;
      await loadAdmins();
      setNewAdmin({ email: '', password: '' });
      setShowAddAdmin(false);
    } catch (err) {
      console.error('Error adding admin:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el administrador');
    }
  }

  async function handleDeleteAdmin(userId: string) {
    try {
      const { count } = await supabase.from('admin_users').select('*', { count: 'exact' });
      if (count === 1) throw new Error('No se puede eliminar el último administrador');
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;
      setAdmins(prev => prev.filter(a => a.id !== userId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting admin:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar el administrador');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-lg text-neutral-400">Cargando administradores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-red-800 bg-red-900/20 p-8 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-medium text-red-200">Error de Acceso</h2>
        <p className="mt-2 text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!admins.length) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center">
        <Users className="mb-4 h-12 w-12 text-neutral-700" />
        <h2 className="text-lg font-medium text-neutral-200">No hay administradores</h2>
        <p className="mt-2 text-sm text-neutral-400">No se encontraron cuentas de administrador en el sistema</p>
        <Button onClick={() => setShowAddAdmin(true)} className="mt-4 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Agregar Admin
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Administradores</h1>
          <p className="mt-1 text-sm text-neutral-400">Gestiona las cuentas de administrador del sistema</p>
        </div>
        <Button onClick={() => setShowAddAdmin(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Agregar Admin
        </Button>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 shadow-lg backdrop-blur">
        <div className="divide-y divide-neutral-800">
          {admins.map(admin => (
            <div key={admin.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-neutral-200">{admin.email}</p>
                <p className="text-sm text-neutral-500">Creado: {new Date(admin.created_at).toLocaleDateString()}</p>
                {admin.last_sign_in_at && (
                  <p className="text-sm text-neutral-500">
                    Último acceso: {new Date(admin.last_sign_in_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              {deleteConfirm === admin.id ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)} className="text-neutral-400 hover:text-neutral-300">
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAdmin(admin.id)} className="text-red-400 hover:text-red-300">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(admin.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {showAddAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl"
            >
              <h2 className="text-lg font-semibold text-white">Agregar Administrador</h2>
              <form onSubmit={handleAddAdmin} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300">Correo Electrónico</label>
                  <Input
                    type="email"
                    required
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="mt-1 border-neutral-800 bg-neutral-800 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300">Contraseña</label>
                  <Input
                    type="password"
                    required
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="mt-1 border-neutral-800 bg-neutral-800 text-neutral-200"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowAddAdmin(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Agregar Administrador</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { AdminSettings } from '../AdminSettings';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Configuración</h1>
      <AdminSettings />
    </div>
  );
}

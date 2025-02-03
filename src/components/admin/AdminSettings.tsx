import { useState, useEffect } from 'react';
import { Save, Key, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../lib/supabase';

const SCORING_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'deepseek', label: 'Deepseek' }
] as const;

const AI_MODELS = {
  openai: [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4o', label: 'GPT-4 Optimized' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ],
  deepseek: [
    { value: 'deepseek-chat', label: 'Deepseek Chat (V3)' },
    { value: 'deepseek-reasoner', label: 'Deepseek Reasoner (R1)' },
    { value: 'deepseek-coder', label: 'Deepseek Coder' }
  ]
} as const;

export function AdminSettings() {
  const [provider, setProvider] = useState<'openai' | 'deepseek'>('openai');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const metadata = session?.user?.user_metadata;
        if (metadata) {
          const savedProvider = metadata.scoring_provider;
          const savedModel = metadata.scoring_model;
          if (savedProvider === 'openai' || savedProvider === 'deepseek') {
            setProvider(savedProvider);
            const validModels = AI_MODELS[savedProvider].map(m => m.value);
            if (savedModel && validModels.includes(savedModel)) {
              setModel(savedModel);
              setHasConfig(true);
            }
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Error al cargar la configuración');
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      if (!model) throw new Error('Por favor selecciona un modelo de IA');
      if (!apiKey) throw new Error('Por favor ingresa una clave API');
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          scoring_provider: provider,
          scoring_model: model,
          [`${provider}_api_key`]: apiKey
        }
      });
      if (updateError) throw updateError;
      setSuccess(true);
      setHasConfig(true);
      setApiKey('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Configuración de Calificación</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Configura el proveedor de IA y las credenciales para calificar respuestas.
          </p>
        </div>
        {hasConfig && (
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm text-green-700">
            <Check className="h-4 w-4" />
            <span>Configurado</span>
          </div>
        )}
      </div>
      <div className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Proveedor de IA</label>
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value as 'openai' | 'deepseek');
              setModel('');
            }}
            className="mt-1 block w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            {SCORING_PROVIDERS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Modelo de IA</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 block w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            <option value="">Selecciona un modelo</option>
            {AI_MODELS[provider].map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          {provider === 'deepseek' && model === 'deepseek-reasoner' && (
            <p className="mt-1 text-xs text-neutral-500">
              DeepSeek Reasoner (R1) es el último modelo de razonamiento de DeepSeek, optimizado para tareas que requieren análisis detallado y evaluación.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Clave API de {provider === 'openai' ? 'OpenAI' : 'Deepseek'}
          </label>
          <div className="mt-1 relative">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'openai' ? 'sk-...' : 'ds-...'}
              className="pr-10"
            />
            <Key className="absolute right-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Tu clave API se almacenará de forma segura y se usará solo para calificar respuestas.
          </p>
        </div>
        {error && <div className="rounded-md bg-red-50 p-2 text-sm text-red-600">{error}</div>}
        {success && <div className="rounded-md bg-green-50 p-2 text-sm text-green-600">Configuración guardada exitosamente</div>}
        <Button onClick={handleSave} disabled={!apiKey || !model || saving} className="mt-4 w-full">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Guardando...' : hasConfig ? 'Actualizar Configuración' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  );
}

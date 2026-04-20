'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PJePage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [useHomologation, setUseHomologation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/pje/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, useHomologation }),
      });
      const data = await res.json();
      setMessage({ type: res.ok ? 'success' : 'error', text: data.message || data.error });
    } catch { setMessage({ type: 'error', text: 'Erro de conexão' }); }
    finally { setLoading(false); }
  };

  const handleTest = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/pje/test');
      const data = await res.json();
      setMessage({ type: res.ok && data.success ? 'success' : 'error', text: data.message || data.error });
    } catch { setMessage({ type: 'error', text: 'Erro de conexão' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-white hover:text-gray-200">← Voltar</Link>
          <h1 className="text-xl font-bold">Integração PJe</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold">API Comunicação Processual</h2>
              <p className="text-sm text-gray-600">Configure o acesso ao PJe</p>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Usuário CNJ</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="homologation" checked={useHomologation} onChange={(e) => setUseHomologation(e.target.checked)} className="mr-2" />
              <label htmlFor="homologation" className="text-sm">Usar ambiente de homologação</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded">{loading ? 'Salvando...' : 'Salvar'}</button>
              <button type="button" onClick={handleTest} disabled={loading} className="flex-1 py-2 bg-green-600 text-white rounded">Testar</button>
            </div>
          </form>

          <div className="mt-6 p-3 bg-gray-50 rounded text-sm text-gray-600">
            <p>• Necessário usuário do CNJ Corporativo</p>
            <p>• Solicite ao administrador do tribunal</p>
          </div>
        </div>
      </main>
    </div>
  );
}
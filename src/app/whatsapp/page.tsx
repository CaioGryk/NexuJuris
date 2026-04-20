'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WhatsAppPage() {
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twilio_sid: twilioSid, twilio_token: twilioToken, twilio_phone: twilioPhone }),
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
      const res = await fetch('/api/whatsapp/test');
      const data = await res.json();
      setMessage({ type: res.ok && data.success ? 'success' : 'error', text: data.message || data.error });
    } catch { setMessage({ type: 'error', text: 'Erro de conexão' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-white hover:text-gray-200">← Voltar</Link>
          <h1 className="text-xl font-bold">WhatsApp</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-semibold">Twilio WhatsApp</h2>
              <p className="text-sm text-gray-600">Configure a integração</p>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account SID</label>
              <input type="text" value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Auth Token</label>
              <input type="password" value={twilioToken} onChange={(e) => setTwilioToken(e.target.value)} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número WhatsApp</label>
              <input type="text" value={twilioPhone} onChange={(e) => setTwilioPhone(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="+5511999999999" required />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 py-2 bg-green-600 text-white rounded">{loading ? 'Salvando...' : 'Salvar'}</button>
              <button type="button" onClick={handleTest} disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded">Testar</button>
            </div>
          </form>

          <div className="mt-6 p-3 bg-gray-50 rounded text-sm text-gray-600">
            <p className="font-medium mb-2">Como obtener credenciais Twilio:</p>
            <p>1. Crie conta em twilio.com</p>
            <p>2. Ative WhatsApp no console</p>
            <p>3. Copie as credenciais</p>
          </div>
        </div>
      </main>
    </div>
  );
}
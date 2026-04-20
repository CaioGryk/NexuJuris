'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Processo {
  id: string;
  numero_processo: string;
  tribunal?: string;
  classe?: string;
  orgao_julgador?: string;
  objeto?: string;
  status?: string;
  distribuicao_data?: string;
  ultimo_andamento?: string;
  created_at: string;
}

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Processo | null>(null);
  const [form, setForm] = useState({ numero_processo: '', tribunal: 'TJSP', classe: '', orgao_julgador: '', objeto: '' });

  useEffect(() => { fetchProcessos(); }, []);

  const fetchProcessos = async () => {
    try {
      const res = await fetch('/api/processos');
      const data = await res.json();
      setProcessos(data.processos || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editando ? `/api/processos?id=${editando.id}` : '/api/processos';
    const method = editando ? 'PUT' : 'POST';
    try {
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      fetchProcessos();
      closeModal();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir processo?')) return;
    try {
      await fetch(`/api/processos?id=${id}`, { method: 'DELETE' });
      fetchProcessos();
    } catch (e) { console.error(e); }
  };

  const openEdit = (p: Processo) => {
    setEditando(p);
    setForm({ numero_processo: p.numero_processo, tribunal: p.tribunal || 'TJSP', classe: p.classe || '', orgao_julgador: p.orgao_julgador || '', objeto: p.objeto || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditando(null);
    setForm({ numero_processo: '', tribunal: 'TJSP', classe: '', orgao_julgador: '', objeto: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-white hover:text-gray-200">← Voltar</Link>
          <h1 className="text-xl font-bold">Processos</h1>
          <button onClick={() => setShowModal(true)} className="bg-white text-blue-600 px-4 py-2 rounded font-medium">+ Novo</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
        ) : processos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">Nenhum processo cadastrado</p>
            <button onClick={() => setShowModal(true)} className="text-blue-600">Cadastrar primeiro processo</button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tribunal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objeto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {processos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{p.numero_processo}</td>
                    <td className="px-4 py-3 text-sm">{p.tribunal || '-'}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{p.objeto || '-'}</td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{p.status || 'ativo'}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(p)} className="text-blue-600 text-sm mr-3">Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 text-sm">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editando ? 'Editar' : 'Novo'} Processo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Número do Processo *</label>
                <input type="text" value={form.numero_processo} onChange={(e) => setForm({...form, numero_processo: e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="0001234-56.2023.8.00.0000" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tribunal</label>
                <select value={form.tribunal} onChange={(e) => setForm({...form, tribunal: e.target.value})} className="w-full px-3 py-2 border rounded">
                  <option value="TJSP">TJSP - São Paulo</option>
                  <option value="TJMG">TJMG - Minas Gerais</option>
                  <option value="TJRJ">TJRJ - Rio de Janeiro</option>
                  <option value="TJRS">TJRS - Rio Grande do Sul</option>
                  <option value="TJBA">TJBA - Bahia</option>
                  <option value="TJPE">TJPE - Pernambuco</option>
                  <option value="TRF1">TRF1 - Federal 1ª</option>
                  <option value="TRF2">TRF2 - Federal 2ª</option>
                  <option value="TRF3">TRF3 - Federal 3ª</option>
                  <option value="TRF4">TRF4 - Federal 4ª</option>
                  <option value="TRF5">TRF5 - Federal 5ª</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Classe</label>
                <input type="text" value={form.classe} onChange={(e) => setForm({...form, classe: e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="Ação Civil Pública" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Órgão Julgador</label>
                <input type="text" value={form.orgao_julgador} onChange={(e) => setForm({...form, orgao_julgador: e.target.value})} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Objeto</label>
                <input type="text" value={form.objeto} onChange={(e) => setForm({...form, objeto: e.target.value})} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-2 border rounded">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded">{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
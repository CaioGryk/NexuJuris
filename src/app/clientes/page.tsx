'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Cliente {
  id: string;
  nome: string;
  whatsapp?: string;
  cpf?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  created_at: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ nome: '', whatsapp: '', cpf: '', email: '', endereco: '', observacoes: '' });

  useEffect(() => { fetchClientes(); }, []);

  const fetchClientes = async () => {
    try {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      setClientes(data.clientes || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editando ? `/api/clientes?id=${editando.id}` : '/api/clientes';
    const method = editando ? 'PUT' : 'POST';
    try {
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      fetchClientes();
      closeModal();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir cliente?')) return;
    try {
      await fetch(`/api/clientes?id=${id}`, { method: 'DELETE' });
      fetchClientes();
    } catch (e) { console.error(e); }
  };

  const openEdit = (cliente: Cliente) => {
    setEditando(cliente);
    setForm({ nome: cliente.nome, whatsapp: cliente.whatsapp || '', cpf: cliente.cpf || '', email: cliente.email || '', endereco: cliente.endereco || '', observacoes: cliente.observacoes || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditando(null);
    setForm({ nome: '', whatsapp: '', cpf: '', email: '', endereco: '', observacoes: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-white hover:text-gray-200">← Voltar</Link>
          <h1 className="text-xl font-bold">Clientes</h1>
          <button onClick={() => setShowModal(true)} className="bg-white text-blue-600 px-4 py-2 rounded font-medium">+ Novo</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
        ) : clientes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">Nenhum cliente cadastrado</p>
            <button onClick={() => setShowModal(true)} className="text-blue-600">Cadastrar primeiro cliente</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientes.map((c) => (
              <div key={c.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{c.nome}</h3>
                    {c.whatsapp && <p className="text-sm text-gray-600">{c.whatsapp}</p>}
                    {c.email && <p className="text-sm text-gray-500">{c.email}</p>}
                  </div>
                  <div className="flex gap-2 text-sm">
                    <button onClick={() => openEdit(c)} className="text-blue-600">Editar</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600">Excluir</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editando ? 'Editar' : 'Novo'} Cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input type="text" value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp</label>
                <input type="text" value={form.whatsapp} onChange={(e) => setForm({...form, whatsapp: e.target.value})} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CPF</label>
                <input type="text" value={form.cpf} onChange={(e) => setForm({...form, cpf: e.target.value})} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Endereço</label>
                <input type="text" value={form.endereco} onChange={(e) => setForm({...form, endereco: e.target.value})} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea value={form.observacoes} onChange={(e) => setForm({...form, observacoes: e.target.value})} className="w-full px-3 py-2 border rounded" rows={2} />
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
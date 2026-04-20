import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">NexuJuris</h1>
          <p className="text-blue-100">Plataforma Jurídica com IA</p>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/clientes" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="text-3xl mb-3">👥</div>
            <h2 className="text-lg font-semibold mb-2">Clientes</h2>
            <p className="text-gray-600 text-sm">Gerencie clientes e contatos</p>
          </Link>

          <Link href="/processos" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="text-3xl mb-3">⚖️</div>
            <h2 className="text-lg font-semibold mb-2">Processos</h2>
            <p className="text-gray-600 text-sm">Acompanhe processos e prazos</p>
          </Link>

          <Link href="/pje" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="text-3xl mb-3">📋</div>
            <h2 className="text-lg font-semibold mb-2">PJe</h2>
            <p className="text-gray-600 text-sm">Integração com tribunal</p>
          </Link>

          <Link href="/whatsapp" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="text-3xl mb-3">💬</div>
            <h2 className="text-lg font-semibold mb-2">WhatsApp</h2>
            <p className="text-gray-600 text-sm">Atendimento IA</p>
          </Link>

          <Link href="/documentos" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="text-3xl mb-3">📄</div>
            <h2 className="text-lg font-semibold mb-2">Documentos</h2>
            <p className="text-gray-600 text-sm">Petições e modelos</p>
          </Link>

          <Link href="/financeiro" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="text-3xl mb-3">💰</div>
            <h2 className="text-lg font-semibold mb-2">Financeiro</h2>
            <p className="text-gray-600 text-sm">Financeiro e honorários</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
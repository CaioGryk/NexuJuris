-- =====================================================
-- NEXUJURIS - Schema Base do Banco de Dados
-- =====================================================

-- =====================================================
-- USUÁRIOS E AUTENTICAÇÃO
-- =====================================================

-- Tabela de usuários (extendida do auth.users do Supabase)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'usuario' CHECK (role IN ('admin', 'usuario', 'estagiario')),
    telefone TEXT,
    oab TEXT,
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CLIENTES
-- =====================================================

CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    whatsapp TEXT,
    cpf TEXT,
    email TEXT,
    endereco TEXT,
    observacoes TEXT,
    origem TEXT DEFAULT 'manual',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROCESSOS
-- =====================================================

CREATE TABLE IF NOT EXISTS processos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    numero_processo TEXT NOT NULL,
    tribunal TEXT,
    classe TEXT,
    orgao_julgador TEXT,
    distribuicao_data TIMESTAMPTZ,
    valor_causa DECIMAL(15,2),
    partes TEXT,
    objeto TEXT,
    status TEXT DEFAULT 'ativo',
    ativo BOOLEAN DEFAULT true,
    ultimo_andamento TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANDAMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS andamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID REFERENCES processos(id) ON DELETE CASCADE,
    data TIMESTAMPTZ NOT NULL,
    descricao TEXT NOT NULL,
    tipo TEXT,
    prazo TIMESTAMPTZ,
    concluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PJE - COMUNICAÇÕES PROCESSUAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS pje_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    use_homologation BOOLEAN DEFAULT false,
    tribunais TEXT[] DEFAULT ARRAY['TJSP'],
    ativo BOOLEAN DEFAULT true,
    ultimo_sincronismo TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pje_comunicacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID REFERENCES processos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    meio TEXT NOT NULL,
    data_publicacao TIMESTAMPTZ NOT NULL,
    descricao TEXT,
    documento JSONB,
    visualizada BOOLEAN DEFAULT false,
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WHATSAAP
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    telefone TEXT NOT NULL,
    sessao_id TEXT,
    ultimo_mensagem TIMESTAMPTZ,
    status TEXT DEFAULT 'ativa',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID REFERENCES whatsapp_conversas(id) ON DELETE CASCADE,
    direcao TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    tipo TEXT DEFAULT 'texto',
    sid TEXT,
    status TEXT DEFAULT 'enviada',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DOCUMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    processo_id UUID REFERENCES processos(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    conteudo TEXT,
    arquivo_url TEXT,
    tags TEXT[],
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FINANCEIRO
-- =====================================================

CREATE TABLE IF NOT EXISTS financeiro_contas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    processo_id UUID REFERENCES processos(id) ON DELETE SET NULL,
    descricao TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    categoria TEXT,
    valor DECIMAL(15,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_usuarios_auth ON usuarios(auth_id);
CREATE INDEX idx_clientes_usuario ON clientes(usuario_id);
CREATE INDEX idx_processos_usuario ON processos(usuario_id);
CREATE INDEX idx_processos_numero ON processos(numero_processo);
CREATE INDEX idx_andamentos_processo ON andamentos(processo_id, data DESC);
CREATE INDEX idx_pje_comunicacoes_processo ON pje_comunicacoes(processo_id, data_publicacao DESC);
CREATE INDEX idx_whatsapp_conversas_cliente ON whatsapp_conversas(cliente_id);
CREATE INDEX idx_whatsapp_mensagens_conversa ON whatsapp_mensagens(conversa_id);
CREATE INDEX idx_documentos_usuario ON documentos(usuario_id);
CREATE INDEX idx_financeiro_usuario ON financeiro_contas(usuario_id, data_vencimento);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE andamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pje_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pje_comunicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_contas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários (ajustar conforme necessário)
DROP POLICY IF EXISTS "Usuários access own data" ON usuarios;
CREATE POLICY "Usuários access own data" ON usuarios FOR ALL USING (auth_id = auth.uid());

-- Para outras tabelas, policy temporária permitindo tudo (ajustar para produção)
-- Em produção, cada tabela deve ter policy baseada em usuario_id
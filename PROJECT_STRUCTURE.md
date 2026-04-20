# ESTRUTURA DO PROJETO NEXUJURIS

---

# package.json
```json
{
  "name": "nexujuris",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@supabase/ssr": "^0.10.2",
    "@supabase/supabase-js": "^2.104.0",
    "next": "16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

# schema.prisma (Supabase -/schema.sql)
```sql
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'usuario',
    telefone TEXT,
    oab TEXT,
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de clientes
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

-- Tabela de processos
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

-- Tabela de andamentos
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

-- Tabela de configuração PJe
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

-- Tabela de comunicações PJe
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

-- Tabela de conversas WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    telefone TEXT NOT NULL,
    sessao_id TEXT,
    ultimo_mensagem TIMESTAMPTZ,
    status TEXT DEFAULT 'ativa',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de mensagens WhatsApp
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

-- Tabela de documentos
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

-- Tabela financeiro
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
    status TEXT DEFAULT 'pendente',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

# app.module.ts (Próprio do Next.js - estrutura de rotas)
```
src/
├── app/
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Página inicial (menu)
│   ├── globals.css         # Estilos globais
│   │
│   ├── clientes/
│   │   └── page.tsx       # UI de clientes
│   │
│   ├── processos/
│   │   └── page.tsx       # UI de processos
│   │
│   ├── pje/
│   │   └── page.tsx        # UI configuração PJe
│   │
│   ├── whatsapp/
│   │   └── page.tsx       # UI configuração WhatsApp
│   │
│   └── api/
│       ├── clientes/
│       │   └── route.ts   # API REST clientes
│       ├── processos/
│       │   └── route.ts  # API REST processos
│       └── pje/
│           ├── config/
│           │   └── route.ts
│           └── test/
│               └── route.ts
│
├── lib/
│   └── supabase/
│       └── client.ts      # Cliente Supabase
│
└── .env.local           # Variáveis de ambiente
```

---

# main.ts (Next.js - entry point)
```typescript
import { createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Criar cliente Supabase (browser)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Criar cliente Supabase (server)
export function createServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookies().getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookies().set(name, value, options)
            })
          } catch {}
        },
      },
    }
  )
}
```

---

# health.controller.ts (API health check)
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.from('clientes').select('id').limit(1)
    
    return NextResponse.json({
      status: 'ok',
      database: error ? 'error' : 'connected',
      timestamp: new Date().toISOString()
    })
  } catch {
    return NextResponse.json({ status: 'error', database: 'disconnected' }, { status: 500 })
  }
}
```

---

# health.service.ts ( serupa ao controller )
```typescript
// Mesmo do health.controller.ts - integrado na API route
```

---

# prisma.service.ts
```typescript
// Não usa Prisma - usa Supabase diretamente
// src/lib/supabase/client.ts já faz a conexão
```

---

# prisma.module.ts
```typescript
// Não usa Prisma - usa Supabase SDK
```

---

# Testes
```bash
# Rodar desenvolvimento
npm run dev

# Build de produção
npm run build

# Verificar lint
npm run lint
```

---

# Resultado ao rodar

## npm run dev (sucesso)
```
▲ Next.js 16.2.4 (Turbopack)
- Local: http://localhost:3000
✓ Ready in ~1000ms
```

## npm run build (sucesso)
```
✓ Ready
✓ Compiled successfully
✓ Output written to .next/
```

---

# Variáveis de Ambiente (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-key

# Twilio (futuro)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# AI (futuro)
OPENAI_API_KEY=
```

---

# Repositório GitHub
https://github.com/CaioGryk/NexuJuris
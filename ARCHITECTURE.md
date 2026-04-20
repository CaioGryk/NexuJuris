# NEXUJURIS - Arquitetura Refatorada

## Estrutura Final

```
nexujuris/
├── apps/
│   ├── web/              # Next.js Frontend (move src原来的)
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   │
│   └── api/              # NestJS Backend (NOVO)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   │
│       │   ├── common/
│       │   │   ├── constants/
│       │   │   ├── decorators/
│       │   │   ├── dto/
│       │   │   ├── enums/
│       │   │   ├── exceptions/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── interfaces/
│       │   │   ├── pipes/
│       │   │   └── utils/
│       │   │
│       │   ├── config/
│       │   │   ├── app/
│       │   │   ├── database/
│       │   │   ├── redis/
│       │   │   └── queue/
│       │   │
│       │   ├── infrastructure/
│       │   │   ├── prisma/
│       │   │   ├── redis/
│       │   │   ├── queue/
│       │   │   └── logger/
│       │   │
│       │   └── modules/
│       │       ├── health/        ✓ Feito
│       │       ├── auth/         (placeholder)
│       │       ├── tenancy/      (placeholder)
│       │       ├── users/       (placeholder)
│       │       └── audit/       (placeholder)
│       │
│       ├── test/
│       ├── package.json
│       ├── tsconfig.json
│       ├── nest-cli.json
│       └── .env.example
│
├── packages/
│   ├── shared/
│   ├── config/
│   └── types/
│
├── prisma/
│   └── schema.prisma     # Modelos Prisma com multi-tenant
│
├── docs/
│
└── supabase/
    └── schema.sql      # Schema original (referência)
```

---

## O que foi mantido

- UI do frontend (clientes, processos, PJe, WhatsApp)
- Schema SQL do Supabase (como referência)
- Cliente Supabase

---

## O que foi criado

### Backend (NestJS)
- `main.ts` - entry point
- `app.module.ts` - módulo raiz
- `HealthModule` - health checks
- `PrismaModule` - database
- `RedisModule` - cache

### Prisma Schema
- Tenant (multi-tenant)
- User (com role)
- Cliente
- Processo
- Andamento
- PJeConfig / PJeComunicacao
- WhatsAppConversation / WhatsAppMessage
- Documento
- Financeiro
- AuditLog

### Testes
- Unit test: `health.service.spec.ts`
- E2E test: `health.e2e-spec.ts`

---

## Como Rodar

### Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev
# http://localhost:3000
```

### Backend (NestJS)
```bash
cd apps/api
npm install
# Configurar .env (copiar de .env.example)
npm run start:dev
# http://localhost:3001
```

### Testes
```bash
cd apps/api
npm test              # unit tests
npm run test:e2e     # e2e tests
```

---

## API Endpoints

- `GET /api/health` - Health check completo
- `GET /api/health/live` - Liveness
- `GET /api/health/ready` - Readiness (database)
- `GET /api/docs` - Swagger UI

---

## Próximos Passos (após esta refatoração)

1. Criar módulo de autenticação (JWT)
2. Migrar API routes do Next.js para NestJS
3. Implementar multi-tenant middleware
4. Adicionar BullMQ para jobs
5. Implementar WhatsApp módulo
6. Adicionar Audit module

---

## GitHub

https://github.com/CaioGryk/NexuJuris
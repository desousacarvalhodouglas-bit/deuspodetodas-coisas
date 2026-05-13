# ServiVizinhos — Product Requirements Document

## Visão geral
App mobile-first de marketplace de serviços locais para Jataí, Goiás e Brasil.
Conecta moradores que precisam de serviços com prestadores próximos.

## Stack
- Frontend: React 19 + TailwindCSS + Shadcn/UI (CRA + craco)
- Backend: FastAPI + Motor (MongoDB async)
- Auth: JWT (bcrypt) custom
- Deploy: Render (frontend static + backend web service)

## Personas
- **Cliente:** publica pedidos de serviço (max 2 grátis, ilimitado se Premium)
- **Prestador:** responde aos pedidos via chat
- **Admin:** `mecjohnson97@gmail.com` — único com acesso ao dashboard

## Requisitos core (implementados)
- [x] Cadastro/login JWT
- [x] Feed público de pedidos (`/feed`)
- [x] Criação de post com fotos comprimidas (JPEG 1024px @ 70%)
- [x] Limite de 2 posts grátis (`isPremium` libera ilimitado)
- [x] Página de assinatura PIX-only (`/abonamento`)
- [x] Chat (mockado — pendente backend real)
- [x] Mapa com Google Maps (pinos mockados)
- [x] Dashboard admin restrito por email
- [x] Mobile: BottomNav + FAB de criar post + responsividade
- [x] Botão "Responder" abre chat com mensagem pré-preenchida "eu tenho interesse no trabalho"
- [x] Visualização de posts pública (anônimos podem ver feed)

## Changelog desta sessão (08/05 → 13/05/2026)
- `lib/imageUtils.js` (novo): compressão de imagens client-side (1024px, JPEG 70%)
- `Home.jsx` + `CreatePostModal.jsx`: substituído `URL.createObjectURL` por base64 comprimido (imagens deixam de quebrar)
- Filtro `isInvalidImageUrl` ignora URLs `blob:` antigas; 7 posts legados foram limpos
- `routers/posts.py`: limit default 50 → 20 (feed mais rápido)
- `auth_utils.py`: novo `get_optional_user_id` (HTTPBearer com `auto_error=False`) — fix para "novos usuários não veem posts"
- `Mensagens.jsx`: lê `location.state`, abre/cria conversa do autor, pré-preenche input
- `Home.jsx`: botão "Responder" navega com state contendo author + mensagem
- `package.json`: `date-fns@4` → `date-fns@3.6.0` (compatibilidade com `react-day-picker@8.10.1`)
- `frontend/.npmrc` (novo): `legacy-peer-deps=true` (build resiliente no Render)
- `render.yaml`: `--network-timeout 600000` no yarn install

## Roadmap (P0 → P2)
### P0 — Não funcional ainda
- **Chat real:** `Mensagens.jsx` usa `mockConversations` hardcoded. Precisa de:
  - Models `Conversation` + `Message`
  - Endpoints `POST /api/messages`, `GET /api/conversations`, `GET /api/conversations/{id}/messages`
  - Persistência no MongoDB
- **PIX dinâmico:** página `/abonamento` mostra QR estático. Integrar Mercado Pago PIX para QR dinâmico + webhook que ativa `isPremium=true`

### P1 — Melhorias de UX
- **Edição de perfil:** `PATCH /api/users/me` (nome, telefone, localização, avatar)
- **Pinos reais no mapa:** geocodificar `post.location` e mostrar pinos clicáveis
- **Painel Admin real:** métricas (usuários totais, posts, premium ativos), listar/banir usuários

### P2 — Refatoração & escala
- Quebrar `Mensagens.jsx` (547 linhas) em sub-componentes
- Criar `/app/backend/tests/` com pytest (cobertura mínima auth + posts)
- Migrar imagens de base64 (MongoDB) para S3/Cloudinary (banco fica gigante senão)
- Web push notifications para "Responder" → notifica autor do post

## Credenciais
- Admin: `mecjohnson97@gmail.com`
- Google Maps Key: `AIzaSyC1rsLAluPX1QVAdblELEVf1rFcOXde3DU`
- MongoDB local: via `MONGO_URL` em `.env`
- JWT secret: hardcoded em `auth_utils.py` (precisa mover para env em P2)

## Deploy
- Repo GitHub: `desousacarvalhodouglas-bit/deuspodetodas-coisas`
- Render frontend: `deuspodetodas-coisas.onrender.com`
- Após qualquer alteração: usar botão "Save to GitHub" no Emergent → Render auto-deploy

# 🚀 Guia de Deploy no Render - ServiVizinhos

## 📋 Pré-requisitos

- [ ] Conta no Render.com (plano Free funciona)
- [ ] Conta no MongoDB Atlas (cluster M0 gratuito)
- [ ] Repositório GitHub com o código
- [ ] Chave do Google Maps API: `AIzaSyC1rsLAluPX1QVAdblELEVf1rFcOXde3DU`

---

## 🗄️ Passo 1: Configurar MongoDB Atlas

1. Acesse https://cloud.mongodb.com
2. Crie um cluster M0 (gratuito)
3. **Database Access**: Crie um usuário com senha
4. **Network Access**: Adicione `0.0.0.0/0` (permitir todos os IPs)
5. **Connect > Drivers**: Copie a connection string:
   ```
   mongodb+srv://usuario:<senha>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Substitua `<senha>` pela senha real

---

## 📤 Passo 2: Subir código no GitHub

```bash
cd /caminho/do/projeto
git init
git add .
git commit -m "feat: servivizinhos - deploy render"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/servivizinhos.git
git push -u origin main
```

**⚠️ Importante**: Verifique que `.env` NÃO foi commitado (está no `.gitignore`)

---

## 🖥️ Passo 3: Deploy Automático via Blueprint

### Opção A: Blueprint Automático (Recomendado)

1. No Render Dashboard: **New** → **Blueprint**
2. Conecte seu repositório GitHub
3. O Render detecta o `render.yaml`
4. Preencha as variáveis de ambiente:

#### Backend (servivizinhos-backend):
```
MONGO_URL=mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/
DB_NAME=servivizinhos
CORS_ORIGINS=https://servivizinhos-frontend.onrender.com
JWT_SECRET=(será gerado automaticamente)
EMERGENT_LLM_KEY=sk-emergent-XXXX (opcional)
```

#### Frontend (servivizinhos-frontend):
```
REACT_APP_BACKEND_URL=https://servivizinhos-backend.onrender.com
NODE_VERSION=20.11.1
CI=false
```

5. Clique em **Apply**
6. Aguarde ~5-10 minutos para build completo

### Opção B: Deploy Manual

#### Backend:
1. **New** → **Web Service**
2. Configurações:
   - **Name**: `servivizinhos-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `bash build.sh`
   - **Start Command**: `bash start.sh`
   - **Plan**: Free (ou Starter para produção)
   - **Health Check Path**: `/api/`

3. **Environment Variables**: (mesmas do Blueprint acima)

#### Frontend:
1. **New** → **Static Site**
2. Configurações:
   - **Name**: `servivizinhos-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn install --frozen-lockfile && yarn build`
   - **Publish Directory**: `build`

3. **Environment Variables**: (mesmas do Blueprint acima)

4. **Redirects/Rewrites**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

---

## 🔧 Passo 4: Atualizar CORS

Após o frontend ficar live, volte no backend:

1. **Environment** → `CORS_ORIGINS`
2. Atualize para a URL exata do frontend:
   ```
   https://servivizinhos-frontend.onrender.com
   ```
3. Salve (redeploy automático acontece)

---

## ✅ Passo 5: Validação

### Testes:

1. **Backend**: 
   ```bash
   curl https://servivizinhos-backend.onrender.com/api/
   # Deve retornar: {"status":"ok"}
   ```

2. **Frontend**: 
   - Acesse https://servivizinhos-frontend.onrender.com
   - Página inicial deve carregar
   - Cadastre uma conta
   - Faça login
   - Teste criar um post

3. **Mapa**:
   - Verifique se o mapa Google carrega
   - API Key já configurada: `AIzaSyC1rsLAluPX1QVAdblELEVf1rFcOXde3DU`

### Checklist:
- [ ] Backend responde em `/api/`
- [ ] Frontend carrega sem erros
- [ ] Cadastro/Login funcionam
- [ ] Criar posts funciona
- [ ] Mapa Google carrega
- [ ] Mensagens funcionam
- [ ] Mobile responsivo funciona
- [ ] Sem erros de CORS no console

---

## 🎨 Passo 6: Domínio Personalizado (Opcional)

1. Backend/Frontend → **Settings** → **Custom Domain**
2. Adicione seu domínio (ex: `api.servivizinhos.com.br`)
3. Configure DNS conforme instruções do Render
4. Atualize `CORS_ORIGINS` e `REACT_APP_BACKEND_URL`

---

## 🐛 Troubleshooting

### ❌ Erro: "Could not connect to MongoDB"
- Verifique Network Access no Atlas (`0.0.0.0/0`)
- Confirme que a senha na URL está correta
- Teste localmente:
  ```bash
  python -c "from pymongo import MongoClient; print(MongoClient('SUA_URL').server_info())"
  ```

### ❌ Frontend tela branca
- Console do navegador mostra erro?
- Verifique `REACT_APP_BACKEND_URL` está correto
- Confirme que rewrite `/* → /index.html` está configurado

### ❌ CORS bloqueando requisições
- `CORS_ORIGINS` no backend deve corresponder EXATAMENTE à URL do frontend
- Sem barra no final
- Após alterar, force redeploy

### ❌ Imagens quebradas nos posts
- Imagens agora têm fallback automático (SVG placeholder)
- Se imagem falhar, mostra "Imagem indisponível"
- Base64 ou URLs válidas funcionam normalmente

### ❌ Serviço "dorme" (Free Tier)
- Free tier hiberna após 15 min sem uso
- Primeira request pode demorar ~30s (cold start)
- Solução: Use UptimeRobot para ping a cada 10 min
- Ou: Upgrade para Starter ($7/mês) = sempre ativo

---

## 💰 Custos

| Serviço | Plano | Custo |
|---------|-------|-------|
| MongoDB Atlas M0 | Free | $0 |
| Render Backend | Free | $0 |
| Render Frontend | Free | $0 |
| **TOTAL** | | **$0/mês** |

**Produção (Recomendado):**
| Serviço | Plano | Custo |
|---------|-------|-------|
| MongoDB Atlas M0 | Free | $0 |
| Render Backend | Starter | $7/mês |
| Render Frontend | Free | $0 |
| **TOTAL** | | **$7/mês** |

---

## 📁 Arquivos Criados para Deploy

```
/app/
├── render.yaml              ← Blueprint Render
├── DEPLOY_RENDER.md         ← Este guia
├── backend/
│   ├── build.sh            ← Build script ✅
│   ├── start.sh            ← Start script ✅
│   ├── runtime.txt         ← Python 3.11.9 ✅
│   └── requirements.txt    ← Dependências
└── frontend/
    └── public/
        └── _redirects      ← SPA routing ✅
```

---

## 🎯 Features Implementadas

✅ Autenticação (Login/Registro)
✅ Feed de Posts
✅ Criar Posts com Fotos/Vídeos
✅ Limite de 2 Posts Gratuitos
✅ Sistema de Assinatura (PIX)
✅ Mensagens (Chat)
✅ Mapa Google com Markers
✅ Admin Dashboard (mecjohnson97@gmail.com)
✅ "Esqueceu Senha"
✅ Responsivo Mobile 100%
✅ Bottom Navigation
✅ Menu Hambúrguer Mobile
✅ Upload de Fotos no Perfil

---

## 🚀 Pronto!

Sua aplicação **ServiVizinhos** está pronta para deploy no Render!

Em caso de dúvidas, consulte os logs:
**Render Dashboard → seu serviço → Logs**

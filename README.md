# 🎬 CineMatch — Descoberta Cinematográfica com IA

> Plataforma inteligente de recomendação de filmes com autenticação, histórico personalizado e dois modos de descoberta: questionário e chat livre com IA.

![CineMatch](https://img.shields.io/badge/Status-Produção-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-green) ![ML](https://img.shields.io/badge/ML-SVD%20MovieLens-blue)

---

## ✨ Funcionalidades

- **Autenticação completa** — cadastro, login com JWT e redefinição de senha
- **Questionário personalizado** — 5 perguntas sobre humor e preferências geram recomendações únicas
- **Chat com IA** — descreva o filme que quer assistir em linguagem natural
- **Histórico de pesquisas** — todas as interações salvas por usuário
- **Modelo de ML real** — SVD treinado com 25 milhões de avaliações do MovieLens 25M
- **Interface cinematográfica** — design dark moderno com animações e tipografia refinada

---

## 🧠 Como funciona
Usuário descreve o que quer
↓
Groq LLaMA 3.1 processa o pedido
↓
Modelo SVD filtra por perfil colaborativo
↓
Recomendações personalizadas com explicação

---

## 🛠️ Stack tecnológica

### Machine Learning
- **Dataset:** MovieLens 25M (25M avaliações, 62K filmes)
- **Modelo:** SVD com TruncatedSVD (scikit-learn)
- **IA:** Groq LLaMA 3.1 8B Instant

### Backend
- **FastAPI** — API REST com Swagger automático
- **SQLAlchemy + SQLite** — banco de dados relacional
- **JWT** — autenticação stateless com python-jose
- **bcrypt** — hash seguro de senhas

### Frontend
- **Next.js 16** com App Router
- **TypeScript** — tipagem estática
- **Tailwind CSS** — estilização utilitária
- **Fontes:** Cormorant Garamond + Syne + JetBrains Mono

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- [MovieLens 25M](https://grouplens.org/datasets/movielens/25m/) extraído em `backend/data/ml-25m/`

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Linux/Mac
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

API disponível em `http://localhost:8000`
Documentação Swagger em `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Cria o arquivo `frontend/.env.local`:
GROQ_API_KEY=sua_chave_groq_aqui

Frontend disponível em `http://localhost:3000`

---

## 📁 Estrutura do projeto
cinematch/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes.py           # endpoints de recomendação
│   │   │   └── auth_routes.py      # cadastro, login, histórico
│   │   ├── core/
│   │   │   └── auth.py             # JWT + bcrypt
│   │   ├── models/
│   │   │   ├── schemas.py          # Pydantic models
│   │   │   └── database.py         # SQLAlchemy + tabelas
│   │   ├── ml/
│   │   │   └── recommender.py      # modelo SVD
│   │   └── main.py
│   ├── notebooks/
│   │   └── 01_exploracao_dados.ipynb
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/               # rotas de autenticação
│   │   │   ├── historico/          # rotas de histórico
│   │   │   └── recomendar/         # integração Groq AI
│   │   ├── page.tsx                # interface principal
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── package.json
└── docker-compose.yml

---

## 🗺️ Roadmap

- [x] Exploração e análise do dataset MovieLens 25M
- [x] Modelo SVD de filtragem colaborativa
- [x] API FastAPI com endpoints documentados
- [x] Autenticação JWT completa
- [x] Integração com Groq LLaMA 3.1
- [x] Interface CineMatch com design cinematográfico
- [x] Histórico de pesquisas por usuário
- [x] Reset de senha
- [ ] Deploy em produção
- [ ] Filtragem por conteúdo (TF-IDF)
- [ ] Sistema híbrido (colaborativo + conteúdo)

---

## 👤 Autor

**Danilo Rodrigues**
[![GitHub](https://img.shields.io/badge/GitHub-danilorodp17-black)](https://github.com/danilorodp17)
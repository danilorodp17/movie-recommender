# 🎬 Movie Recommender

Sistema de recomendação de filmes com filtragem colaborativa, filtragem por conteúdo e abordagem híbrida, com explicabilidade das recomendações.

## 🚀 Tecnologias

**Machine Learning**
- Python, Pandas, NumPy
- Scikit-Surprise (SVD)
- Scikit-learn (TF-IDF, Cosine Similarity)

**Backend**
- FastAPI
- SQLAlchemy
- SQLite (dev) / PostgreSQL (prod)

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

**Infraestrutura**
- Docker / Docker Compose
- Vercel (frontend)
- Render (backend)

## 🧠 Como funciona

O sistema combina duas abordagens de recomendação:

1. **Filtragem Colaborativa (SVD):** recomenda filmes com base no histórico de avaliações de usuários com gostos similares
2. **Filtragem por Conteúdo (TF-IDF):** recomenda filmes parecidos com os que o usuário já gostou, usando gênero e descrição
3. **Abordagem Híbrida:** combina os dois modelos com pesos ajustáveis, resolvendo o problema de cold-start

## 📊 Dataset

[MovieLens 25M](https://grouplens.org/datasets/movielens/25m/) — 25 milhões de avaliações, 62 mil filmes, 162 mil usuários.

## ⚙️ Como rodar localmente

### Pré-requisitos
- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API disponível em: `http://localhost:8000`
Documentação: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em: `http://localhost:3000`

## 📁 Estrutura do projeto

movie-recommender/
├── backend/
│   ├── app/
│   │   ├── api/          # endpoints FastAPI
│   │   ├── core/         # configurações
│   │   ├── models/       # schemas Pydantic
│   │   ├── services/     # lógica de negócio
│   │   └── ml/           # modelos de ML
│   ├── notebooks/        # exploração dos dados
│   └── requirements.txt
├── frontend/             # Next.js (em desenvolvimento)
└── docker-compose.yml

## 🗺️ Roadmap

- [x] Estrutura do projeto
- [x] Exploração do dataset MovieLens
- [ ] Modelo SVD (filtragem colaborativa)
- [ ] Filtragem por conteúdo
- [ ] Sistema híbrido
- [ ] API FastAPI completa
- [ ] Frontend Next.js
- [ ] Deploy

## 👤 Autor

**Danilo Rodrigues**
[\@danilorodp17](https://github.com/danilorodp17)
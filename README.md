# 🎬 CineMatch — Descoberta Cinematográfica com IA

Plataforma **Full Stack** desenvolvida para recomendação personalizada de filmes, permitindo que usuários descubram novas produções por meio de um questionário de preferências ou de uma conversa livre com Inteligência Artificial.

O projeto combina **Next.js**, **FastAPI**, **Machine Learning** e **Inteligência Artificial generativa**, utilizando dados do MovieLens 25M para oferecer recomendações baseadas no perfil e no contexto informado pelo usuário.

---

## 🚀 Tecnologias Utilizadas

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* Pydantic
* JWT
* python-jose
* bcrypt
* Uvicorn

### Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* App Router

### Machine Learning e IA

* Scikit-learn
* TruncatedSVD
* Pandas
* NumPy
* MovieLens 25M
* Groq API
* LLaMA 3.1 8B Instant

---

## 📂 Estrutura do Projeto

```text
cinematch
│
├── backend
│   ├── app
│   │   ├── api
│   │   │   ├── routes.py
│   │   │   └── auth_routes.py
│   │   ├── core
│   │   │   └── auth.py
│   │   ├── models
│   │   │   ├── schemas.py
│   │   │   └── database.py
│   │   ├── ml
│   │   │   └── recommender.py
│   │   └── main.py
│   ├── data
│   │   └── ml-25m
│   ├── notebooks
│   │   └── 01_exploracao_dados.ipynb
│   └── requirements.txt
│
├── frontend
│   ├── app
│   │   ├── api
│   │   │   ├── auth
│   │   │   ├── historico
│   │   │   └── recomendar
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

# 📋 Funcionalidades

O sistema oferece:

* ✅ Cadastro de usuários
* ✅ Login seguro com autenticação JWT
* ✅ Criptografia de senhas utilizando bcrypt
* ✅ Redefinição de senha
* ✅ Questionário personalizado com perguntas sobre humor e preferências
* ✅ Recomendação de filmes com base nas respostas do usuário
* ✅ Chat livre com Inteligência Artificial
* ✅ Processamento de linguagem natural
* ✅ Histórico de pesquisas por usuário
* ✅ Modelo de recomendação utilizando SVD
* ✅ Integração com o dataset MovieLens 25M
* ✅ Interface moderna com identidade visual cinematográfica
* ✅ Comunicação entre frontend e backend por API REST

---

# 🖥️ Interface do Sistema

A aplicação possui uma interface moderna desenvolvida em **Next.js** com **Tailwind CSS**, utilizando uma identidade visual inspirada no universo cinematográfico.

Entre as principais telas estão:

* Tela inicial
* Cadastro de usuário
* Login
* Questionário de preferências
* Chat com Inteligência Artificial
* Tela de recomendações
* Histórico de pesquisas
* Redefinição de senha

A interface utiliza as fontes:

* Cormorant Garamond
* Syne
* JetBrains Mono

---

# 🏗️ Arquitetura

O projeto utiliza uma arquitetura Full Stack, separando as responsabilidades entre frontend, backend, banco de dados, Inteligência Artificial e Machine Learning.

```text
Usuário

      │

      ▼

Frontend Next.js

      │

      ▼

API FastAPI

      │

      ├───────────────┐
      ▼               ▼

Groq LLaMA 3.1     Modelo SVD

      │               │

      └───────┬───────┘
              ▼

Recomendações personalizadas

              │

              ▼

SQLAlchemy

              │

              ▼

SQLite
```

Essa organização facilita:

* manutenção do código;
* separação de responsabilidades;
* integração entre diferentes tecnologias;
* escalabilidade;
* testes;
* evolução do modelo de recomendação.

---

# 🧠 Sistema de Recomendação

O CineMatch utiliza um sistema de recomendação baseado em **filtragem colaborativa**, aplicando o algoritmo de decomposição matricial SVD.

O modelo foi desenvolvido utilizando o dataset **MovieLens 25M**, que contém aproximadamente:

* 25 milhões de avaliações;
* 62 mil filmes;
* dados de usuários;
* gêneros;
* tags;
* relações entre usuários e filmes.

Fluxo do modelo:

```text
Avaliações dos usuários

      │

      ▼

Matriz usuário × filme

      │

      ▼

TruncatedSVD

      │

      ▼

Identificação de padrões

      │

      ▼

Estimativa de afinidade

      │

      ▼

Ranking de filmes
```

O modelo identifica padrões presentes nas avaliações e utiliza fatores latentes para estimar quais filmes possuem maior compatibilidade com o perfil do usuário.

---

# 🤖 Inteligência Artificial

A aplicação utiliza a API da **Groq** com o modelo **LLaMA 3.1 8B Instant** para interpretar as solicitações feitas em linguagem natural.

Fluxo:

```text
Usuário descreve o filme desejado

      │

      ▼

Groq LLaMA 3.1 interpreta o pedido

      │

      ▼

Identificação de gêneros, humor e contexto

      │

      ▼

Modelo SVD filtra os filmes

      │

      ▼

Recomendações com explicação personalizada
```

Exemplo de solicitação:

```text
Quero assistir a um suspense psicológico,
com clima misterioso e final surpreendente.
```

A Inteligência Artificial interpreta as características da solicitação e auxilia o modelo de recomendação na seleção dos filmes mais adequados.

---

# 🔐 Autenticação

O sistema utiliza **JSON Web Token (JWT)** para autenticação dos usuários.

Fluxo:

```text
Cadastro ou Login

      │

      ▼

Validação dos dados

      │

      ▼

Geração do Token JWT

      │

      ▼

Acesso às rotas protegidas

      │

      ▼

Histórico individual do usuário
```

As senhas são armazenadas de forma segura utilizando **bcrypt**, evitando que credenciais sejam salvas em texto simples.

---

# 📊 Fluxo de Funcionamento

```text
Usuário

      │

      ▼

Cadastro ou Login

      │

      ▼

Tela Principal

      │

      ├────────────────────┐
      ▼                    ▼

Questionário             Chat com IA

      │                    │

      ▼                    ▼

Preferências           Pedido em linguagem natural

      │                    │

      └──────────┬─────────┘
                 ▼

Processamento com IA e Machine Learning

                 │

                 ▼

Recomendações personalizadas

                 │

                 ▼

Histórico de pesquisas
```

---

# ⚙️ Como Executar

## 1. Clone o repositório

```bash
git clone https://github.com/danilorodp17/cinematch.git
```

Entre na pasta do projeto:

```bash
cd cinematch
```

---

## 2. Baixar o Dataset

Baixe o dataset MovieLens 25M:

```text
https://grouplens.org/datasets/movielens/25m/
```

Extraia os arquivos no diretório:

```text
backend/data/ml-25m/
```

---

## 3. Configurar o Backend

Acesse a pasta:

```bash
cd backend
```

Crie o ambiente virtual:

```bash
python -m venv venv
```

Ative o ambiente virtual no Windows:

```bash
venv\Scripts\activate
```

No Linux ou macOS:

```bash
source venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Inicie o servidor:

```bash
python -m uvicorn app.main:app --reload
```

Servidor disponível em:

```text
http://localhost:8000
```

Documentação Swagger disponível em:

```text
http://localhost:8000/docs
```

---

## 4. Configurar o Frontend

Em outro terminal:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env.local`:

```env
GROQ_API_KEY=sua_chave_groq_aqui

NEXT_PUBLIC_API_URL=http://localhost:8000
```

Execute a aplicação:

```bash
npm run dev
```

Frontend disponível em:

```text
http://localhost:3000
```

---

# 🗄️ Banco de Dados

O projeto utiliza **SQLite** como banco de dados relacional e **SQLAlchemy** para gerenciamento das entidades e operações.

Principais informações armazenadas:

* Usuários
* Senhas criptografadas
* Histórico de pesquisas
* Perguntas realizadas
* Preferências informadas
* Recomendações geradas

O SQLite facilita o desenvolvimento e a execução local do projeto.

Para uma futura implantação em produção, o banco pode ser migrado para **PostgreSQL**.

---

# 🌐 API REST

A comunicação entre frontend e backend ocorre por meio de uma API REST construída com FastAPI.

Exemplo de fluxo:

```text
Frontend Next.js

↓

Requisição HTTP

↓

FastAPI

↓

Validação com Pydantic

↓

Serviço de Recomendação

↓

Modelo SVD e Groq AI

↓

SQLAlchemy

↓

SQLite

↓

Resposta JSON

↓

Frontend
```

O FastAPI também disponibiliza documentação automática dos endpoints por meio do Swagger.

---

# 📚 Conceitos Aplicados

Durante o desenvolvimento foram utilizados conceitos de:

* Desenvolvimento Full Stack
* APIs REST
* Python
* FastAPI
* Next.js
* React
* TypeScript
* Tailwind CSS
* SQLAlchemy
* Banco de Dados Relacional
* Autenticação JWT
* Criptografia de Senhas
* Machine Learning
* Sistemas de Recomendação
* Filtragem Colaborativa
* Redução de Dimensionalidade
* SVD
* Processamento de Linguagem Natural
* Integração com Inteligência Artificial
* Arquitetura em Camadas
* Organização de Código
* Boas Práticas de Desenvolvimento

---

# 🗺️ Roadmap

* [x] Exploração e análise do dataset MovieLens 25M
* [x] Preparação dos dados
* [x] Modelo SVD de filtragem colaborativa
* [x] API REST desenvolvida com FastAPI
* [x] Documentação automática com Swagger
* [x] Cadastro de usuários
* [x] Login com JWT
* [x] Criptografia de senhas
* [x] Redefinição de senha
* [x] Integração com Groq LLaMA 3.1
* [x] Questionário de preferências
* [x] Chat em linguagem natural
* [x] Interface com design cinematográfico
* [x] Histórico de pesquisas
* [ ] Deploy do frontend
* [ ] Deploy do backend
* [ ] Migração para PostgreSQL
* [ ] Testes automatizados
* [ ] Filtragem baseada em conteúdo
* [ ] Sistema híbrido de recomendação
* [ ] Integração com API de filmes

---

# 💡 Possíveis Melhorias

* Migrar o banco de dados para PostgreSQL.
* Criar sistema híbrido combinando filtragem colaborativa e conteúdo.
* Implementar filtragem por conteúdo utilizando TF-IDF.
* Integrar uma API externa para exibir pôsteres, trailers e sinopses.
* Criar lista de filmes favoritos.
* Permitir que o usuário avalie as recomendações.
* Utilizar o histórico para melhorar futuras sugestões.
* Adicionar confirmação de e-mail.
* Implementar recuperação de senha por e-mail.
* Criar testes automatizados para frontend e backend.
* Implementar refresh token.
* Adicionar Docker e Docker Compose.
* Criar pipeline de CI/CD com GitHub Actions.
* Implantar o sistema em ambiente de produção.
* Adicionar métricas de avaliação do modelo, como RMSE e Precision@K.

---

# 🎯 Objetivo do Projeto

Este projeto foi desenvolvido com o objetivo de aplicar conhecimentos em **Desenvolvimento Full Stack**, **Machine Learning** e **Inteligência Artificial**, integrando frontend, backend, banco de dados e um sistema de recomendação em uma única aplicação.

Além de explorar autenticação, APIs REST e persistência de dados, o CineMatch demonstra a utilização de Machine Learning para análise de preferências e de Inteligência Artificial generativa para interpretação de solicitações em linguagem natural.

O projeto também busca demonstrar como diferentes tecnologias podem ser combinadas para criar uma experiência personalizada e resolver um problema real de descoberta de conteúdo.

---

# 👨‍💻 Autor

**Danilo Rodrigues Parolin**

* GitHub: https://github.com/danilorodp17
* LinkedIn: https://www.linkedin.com/in/danilo-parolin/

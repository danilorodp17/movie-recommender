from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Movie Recommender API",
    description="Sistema de recomendação de filmes com filtragem colaborativa e por conteúdo",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Movie Recommender API", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy"}
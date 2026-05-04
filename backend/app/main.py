from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.routes import router
from app.ml.recommender import recommender

@asynccontextmanager
async def lifespan(app: FastAPI):
    recommender.carregar_modelo()
    yield

app = FastAPI(
    title="Movie Recommender API",
    description="Sistema de recomendação de filmes com filtragem colaborativa",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Movie Recommender API", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy"}
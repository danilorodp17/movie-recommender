from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Auth schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Filme schemas
class Filme(BaseModel):
    movieId: int
    title: str
    genres: str

class RecomendacaoItem(BaseModel):
    movieId: int
    title: str
    genres: str
    score: float

class RecomendacaoResponse(BaseModel):
    user_id: int
    total: int
    recomendacoes: List[RecomendacaoItem]

# Histórico schemas
class HistoricoCreate(BaseModel):
    tipo: str  # "chat" ou "questionario"
    prompt: str
    filmes_recomendados: str  # JSON string

class HistoricoResponse(BaseModel):
    id: int
    tipo: str
    prompt: str
    filmes_recomendados: str
    created_at: datetime

    class Config:
        from_attributes = True
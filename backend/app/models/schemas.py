from pydantic import BaseModel
from typing import List, Optional

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

class FilmesAvaliados(BaseModel):
    user_id: int
    total: int
    filmes: List[dict]
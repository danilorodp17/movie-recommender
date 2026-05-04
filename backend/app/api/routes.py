from fastapi import APIRouter, HTTPException, Query
from app.ml.recommender import recommender
from app.models.schemas import RecomendacaoResponse

router = APIRouter()

@router.get("/recomendacoes/{user_id}", response_model=RecomendacaoResponse)
def get_recomendacoes(
    user_id: int,
    n: int = Query(default=10, ge=1, le=50, description="Número de recomendações")
):
    resultado = recommender.recomendar(user_id, n)
    if resultado is None:
        raise HTTPException(status_code=404, detail=f"Usuário {user_id} não encontrado")

    return RecomendacaoResponse(
        user_id=user_id,
        total=len(resultado),
        recomendacoes=resultado
    )

@router.get("/usuarios/{user_id}/filmes-avaliados")
def get_filmes_avaliados(
    user_id: int,
    n: int = Query(default=10, ge=1, le=100)
):
    resultado = recommender.filmes_avaliados(user_id, n)
    if resultado is None:
        raise HTTPException(status_code=404, detail=f"Usuário {user_id} não encontrado")

    return {"user_id": user_id, "total": len(resultado), "filmes": resultado}

@router.get("/filmes/buscar")
def buscar_filmes(
    q: str = Query(..., min_length=2, description="Termo de busca"),
    n: int = Query(default=10, ge=1, le=50)
):
    resultado = recommender.buscar_filmes(q, n)
    return {"query": q, "total": len(resultado), "filmes": resultado}

@router.get("/filmes/populares")
def get_filmes_populares():
    populares = [
        {"movieId": 318, "title": "Shawshank Redemption, The (1994)", "genres": "Crime|Drama"},
        {"movieId": 296, "title": "Pulp Fiction (1994)", "genres": "Crime|Drama|Thriller"},
        {"movieId": 356, "title": "Forrest Gump (1994)", "genres": "Comedy|Drama|Romance"},
        {"movieId": 593, "title": "Silence of the Lambs, The (1991)", "genres": "Crime|Horror|Thriller"},
        {"movieId": 2571, "title": "Matrix, The (1999)", "genres": "Action|Sci-Fi|Thriller"},
    ]
    return {"total": len(populares), "filmes": populares}
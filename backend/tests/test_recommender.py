from unittest.mock import MagicMock
from app.ml.recommender import recommender

def test_get_recomendacoes_sucesso(client):
    # Definindo retorno mockado para o teste
    recommender.recomendar.return_value = [
        {"movieId": 1, "title": "Filme Recomendado 1", "genres": "Drama", "score": 4.8},
        {"movieId": 2, "title": "Filme Recomendado 2", "genres": "Action", "score": 4.5}
    ]
    
    response = client.get("/api/v1/recomendacoes/13?n=5")
    assert response.status_code == 200
    
    res_json = response.json()
    assert res_json["user_id"] == 13
    assert res_json["total"] == 2
    assert len(res_json["recomendacoes"]) == 2
    assert res_json["recomendacoes"][0]["title"] == "Filme Recomendado 1"
    assert res_json["recomendacoes"][0]["score"] == 4.8
    
    # Verifica se a função foi chamada com os parâmetros corretos
    recommender.recomendar.assert_called_with(13, 5)

def test_get_recomendacoes_usuario_nao_encontrado(client):
    recommender.recomendar.return_value = None
    
    response = client.get("/api/v1/recomendacoes/999?n=10")
    assert response.status_code == 404
    assert response.json()["detail"] == "Usuário 999 não encontrado"

def test_get_filmes_avaliados_sucesso(client):
    recommender.filmes_avaliados.return_value = [
        {"movieId": 10, "title": "Filme Avaliado 10", "genres": "Comedy", "rating": 5.0}
    ]
    
    response = client.get("/api/v1/usuarios/5/filmes-avaliados?n=3")
    assert response.status_code == 200
    
    res_json = response.json()
    assert res_json["user_id"] == 5
    assert res_json["total"] == 1
    assert res_json["filmes"][0]["movieId"] == 10
    
    recommender.filmes_avaliados.assert_called_with(5, 3)

def test_get_filmes_avaliados_usuario_nao_encontrado(client):
    recommender.filmes_avaliados.return_value = None
    
    response = client.get("/api/v1/usuarios/999/filmes-avaliados")
    assert response.status_code == 404
    assert response.json()["detail"] == "Usuário 999 não encontrado"

def test_buscar_filmes_sucesso(client):
    recommender.buscar_filmes.return_value = [
        {"movieId": 3, "title": "Search Movie 3", "genres": "Sci-Fi"}
    ]
    
    response = client.get("/api/v1/filmes/buscar?q=matrix&n=5")
    assert response.status_code == 200
    
    res_json = response.json()
    assert res_json["query"] == "matrix"
    assert res_json["total"] == 1
    assert res_json["filmes"][0]["title"] == "Search Movie 3"
    
    recommender.buscar_filmes.assert_called_with("matrix", 5)

def test_buscar_filmes_validacao_query_curta(client):
    # O parâmetro q deve ter min_length=2 no FastApi
    response = client.get("/api/v1/filmes/buscar?q=a")
    assert response.status_code == 422

def test_get_filmes_populares(client):
    response = client.get("/api/v1/filmes/populares")
    assert response.status_code == 200
    
    res_json = response.json()
    assert "total" in res_json
    assert len(res_json["filmes"]) > 0
    assert "movieId" in res_json["filmes"][0]
    assert "title" in res_json["filmes"][0]

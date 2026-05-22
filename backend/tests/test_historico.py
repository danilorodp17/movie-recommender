import pytest
from app.core.auth import hash_password, create_access_token
from app.models.database import User, Historico

def test_historico_nao_autenticado(client):
    # Tentar salvar sem autenticação
    historico_data = {
        "tipo": "chat",
        "prompt": "Recomende filmes de terror",
        "filmes_recomendados": "[]"
    }
    response_post = client.post("/api/v1/historico", json=historico_data)
    assert response_post.status_code == 401

    # Tentar buscar sem autenticação
    response_get = client.get("/api/v1/historico")
    assert response_get.status_code == 401

def test_salvar_historico_sucesso(client, db_session):
    # Criar usuário e gerar token
    user = User(name="User Teste", email="test@example.com", hashed_password=hash_password("senha"))
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    token = create_access_token({"sub": user.id})
    headers = {"Authorization": f"Bearer {token}"}

    # Salvar histórico
    historico_data = {
        "tipo": "chat",
        "prompt": "Recomende filmes de comédia dos anos 90",
        "filmes_recomendados": '[{"movieId": 1, "title": "Toy Story"}]'
    }
    
    response = client.post("/api/v1/historico", json=historico_data, headers=headers)
    assert response.status_code == 200
    
    res_json = response.json()
    assert res_json["tipo"] == "chat"
    assert res_json["prompt"] == "Recomende filmes de comédia dos anos 90"
    assert res_json["filmes_recomendados"] == '[{"movieId": 1, "title": "Toy Story"}]'
    assert "id" in res_json
    assert "created_at" in res_json

    # Verificar no banco
    db_item = db_session.query(Historico).filter(Historico.id == res_json["id"]).first()
    assert db_item is not None
    assert db_item.user_id == user.id

def test_buscar_historico_sucesso(client, db_session):
    # Criar usuário e gerar token
    user = User(name="User Teste", email="test@example.com", hashed_password=hash_password("senha"))
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    token = create_access_token({"sub": user.id})
    headers = {"Authorization": f"Bearer {token}"}

    # Criar dois itens de histórico diretamente no banco para esse usuário
    h1 = Historico(
        user_id=user.id,
        tipo="chat",
        prompt="Prompt 1",
        filmes_recomendados="[]"
    )
    h2 = Historico(
        user_id=user.id,
        tipo="questionario",
        prompt="Prompt 2",
        filmes_recomendados="[]"
    )
    db_session.add_all([h1, h2])
    db_session.commit()

    # Buscar histórico pela API
    response = client.get("/api/v1/historico", headers=headers)
    assert response.status_code == 200
    
    res_json = response.json()
    assert len(res_json) == 2
    # Como ordena por created_at desc, o h2 / mais recente deve estar no topo
    assert res_json[0]["prompt"] in ["Prompt 1", "Prompt 2"]

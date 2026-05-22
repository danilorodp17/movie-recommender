import pytest
from jose import jwt
from app.core.auth import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from app.models.database import User

# ==========================================
# 1. Testes Unitários de Funções de Autenticação
# ==========================================

def test_hash_and_verify_password():
    password = "secret_password"
    hashed = hash_password(password)
    
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_create_access_token():
    data = {"sub": 42}
    token = create_access_token(data)
    
    assert isinstance(token, str)
    
    # Decodificar e validar o payload
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload.get("sub") == 42
    assert "exp" in payload


# ==========================================
# 2. Testes de Integração de API (Rotas de Auth)
# ==========================================

def test_cadastro_usuario_sucesso(client):
    user_data = {
        "name": "Maria Teste",
        "email": "maria@example.com",
        "password": "senha123"
    }
    response = client.post("/api/v1/auth/cadastro", json=user_data)
    assert response.status_code == 200
    
    res_json = response.json()
    assert "access_token" in res_json
    assert res_json["token_type"] == "bearer"
    assert res_json["user"]["name"] == "Maria Teste"
    assert res_json["user"]["email"] == "maria@example.com"
    assert "id" in res_json["user"]

def test_cadastro_email_duplicado(client, db_session):
    # Cadastrar primeiro usuário
    user_data = {
        "name": "Maria Teste",
        "email": "maria@example.com",
        "password": "senha123"
    }
    client.post("/api/v1/auth/cadastro", json=user_data)
    
    # Tentar cadastrar com o mesmo e-mail
    response = client.post("/api/v1/auth/cadastro", json=user_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email já cadastrado"

def test_login_sucesso(client, db_session):
    # Criar um usuário diretamente no banco
    hashed = hash_password("minhasenha")
    user = User(name="João Teste", email="joao@example.com", hashed_password=hashed)
    db_session.add(user)
    db_session.commit()
    
    # Tentar fazer login
    login_data = {
        "email": "joao@example.com",
        "password": "minhasenha"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    
    res_json = response.json()
    assert "access_token" in res_json
    assert res_json["user"]["email"] == "joao@example.com"

def test_login_senha_incorreta(client, db_session):
    # Criar usuário
    hashed = hash_password("minhasenha")
    user = User(name="João Teste", email="joao@example.com", hashed_password=hashed)
    db_session.add(user)
    db_session.commit()
    
    # Login com senha errada
    login_data = {
        "email": "joao@example.com",
        "password": "senha_errada"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401
    assert response.json()["detail"] == "Email ou senha incorretos"

def test_login_usuario_inexistente(client):
    login_data = {
        "email": "inexistente@example.com",
        "password": "senha"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401
    assert response.json()["detail"] == "Email ou senha incorretos"

def test_get_me_sucesso(client, db_session):
    # Criar usuário e gerar token
    user = User(name="João Teste", email="joao@example.com", hashed_password=hash_password("senha"))
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    token = create_access_token({"sub": user.id})
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["name"] == "João Teste"
    assert res_json["email"] == "joao@example.com"
    assert res_json["id"] == user.id

def test_get_me_nao_autorizado(client):
    # Sem header de autorização
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    
    # Com token inválido
    headers = {"Authorization": "Bearer token_invalido_qualquer"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401

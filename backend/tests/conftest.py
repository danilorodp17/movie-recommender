import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1. Mock do Recommender ANTES de importar o app para evitar carregar datasets pesados
from app.ml.recommender import recommender
recommender.carregar_modelo = MagicMock()
recommender.recomendar = MagicMock(return_value=[
    {"movieId": 1, "title": "Mock Movie 1", "genres": "Action", "score": 4.5},
    {"movieId": 2, "title": "Mock Movie 2", "genres": "Comedy", "score": 4.0}
])
recommender.filmes_avaliados = MagicMock(return_value=[
    {"movieId": 10, "title": "Watched Movie 1", "genres": "Drama", "rating": 5.0}
])
recommender.buscar_filmes = MagicMock(return_value=[
    {"movieId": 3, "title": "Search Movie 3", "genres": "Sci-Fi"}
])

# 2. Configurações de Banco de Dados de Teste (SQLite em memória)
from app.models.database import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # Cria as tabelas na base de dados de teste
    Base.metadata.create_all(bind=engine)
    yield
    # Remove as tabelas após o fim da sessão de testes
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(autouse=True)
def override_db(db_session):
    def _get_db_override():
        yield db_session
    
    app.dependency_overrides[get_db] = _get_db_override
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture
def client():
    # Usando lifespan context manager do TestClient para rodar eventos startup/shutdown
    with TestClient(app) as c:
        yield c

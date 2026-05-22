from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db, User, Historico
from app.models.schemas import UserCreate, UserLogin, Token, HistoricoCreate, HistoricoResponse
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user
from typing import List

router = APIRouter()

@router.post("/auth/cadastro", response_model=Token)
def cadastro(user_data: UserCreate, db: Session = Depends(get_db)):
    # Verifica se email já existe
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})
    return Token(
        access_token=token,
        token_type="bearer",
        user={"id": user.id, "name": user.name, "email": user.email}
    )

@router.post("/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")

    token = create_access_token({"sub": user.id})
    return Token(
        access_token=token,
        token_type="bearer",
        user={"id": user.id, "name": user.name, "email": user.email}
    )

@router.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}

@router.post("/historico", response_model=HistoricoResponse)
def salvar_historico(
    data: HistoricoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    historico = Historico(
        user_id=current_user.id,
        tipo=data.tipo,
        prompt=data.prompt,
        filmes_recomendados=data.filmes_recomendados
    )
    db.add(historico)
    db.commit()
    db.refresh(historico)
    return historico

@router.get("/historico", response_model=List[HistoricoResponse])
def get_historico(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Historico).filter(
        Historico.user_id == current_user.id
    ).order_by(Historico.created_at.desc()).all()

@router.post("/auth/reset-password")
def reset_password(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    nova_senha = data.get("nova_senha")
    
    if not email or not nova_senha:
        raise HTTPException(status_code=400, detail="Email e nova senha são obrigatórios")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email não encontrado")
    
    if len(nova_senha) < 6:
        raise HTTPException(status_code=400, detail="Senha deve ter pelo menos 6 caracteres")
    
    user.hashed_password = hash_password(nova_senha)
    db.commit()
    
    return {"message": "Senha alterada com sucesso"}
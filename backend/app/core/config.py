from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CineMatch API"
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite:///./cinematch.db"
    SECRET_KEY: str = "change-this-in-production"

    class Config:
        env_file = ".env"

settings = Settings()
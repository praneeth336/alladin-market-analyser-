import os

try:
    from pydantic_settings import BaseSettings
    class Settings(BaseSettings):
        APP_NAME: str = "Alladin"
        API_V1_STR: str = "/api"
        DEFAULT_INDIA_BENCHMARK: str = "^NSEI"
        DEFAULT_US_BENCHMARK: str = "^GSPC"
        AI_PROVIDER: str = os.getenv("AI_PROVIDER", "fallback")
        OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
        OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
except ImportError:
    from pydantic import BaseModel
    class Settings(BaseModel):
        APP_NAME: str = "Alladin"
        API_V1_STR: str = "/api"
        DEFAULT_INDIA_BENCHMARK: str = "^NSEI"
        DEFAULT_US_BENCHMARK: str = "^GSPC"
        AI_PROVIDER: str = os.getenv("AI_PROVIDER", "fallback")
        OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
        OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

settings = Settings()

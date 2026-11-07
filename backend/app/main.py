import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import stock

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Stock Research Platform - Financial Fundamentals, Technical Analytics & SEBI Guardrails",
    version="1.0.0"
)

# Enable CORS for development flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(stock.router)

# Combined Single-Server Deployment: Serve built React frontend directly from FastAPI
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    @app.get("/")
    async def root():
        return {
            "status": "online",
            "app": settings.APP_NAME,
            "docs": "/docs",
            "version": "1.0.0"
        }

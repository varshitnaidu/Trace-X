import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Add parent directory to sys.path to allow running directly: python app/main.py
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print(f"[{settings.PROJECT_NAME}] Platform Initialized. Mode: {'DEMO' if settings.DEMO_MODE else 'LIVE'}")
    yield
    # Teardown actions
    print(f"[{settings.PROJECT_NAME}] Shutting down platform.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Email Threat Intelligence & Digital Forensics Platform (SIH26106)",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} - {settings.TAGLINE}",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)


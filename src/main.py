"""FastAPI main application."""
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .config import get_settings
from .api.routes import planner, validation, domains, auth, progress, projects


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    settings = get_settings()
    
    app = FastAPI(
        title=settings.app_name,
        description="Domain-Independent Classical Planning Workbench",
        version="0.1.0",
        debug=settings.debug
    )
    
    # CORS middleware - must be first
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins for now
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # API routes first (before catch-all)
    app.include_router(auth.router)
    app.include_router(planner.router)
    app.include_router(validation.router)
    app.include_router(domains.router)
    app.include_router(progress.router)
    app.include_router(projects.router)
    
    @app.get("/api/health")
    async def health():
        """Health check endpoint."""
        return {"status": "healthy"}
    
    # Serve static frontend files last
    frontend_dir = Path(__file__).parent.parent / "frontend" / "dist"
    if frontend_dir.exists():
        # Serve static files
        app.mount("/assets", StaticFiles(directory=frontend_dir / "assets"), name="assets")
        
        @app.get("/")
        async def serve_index():
            return FileResponse(frontend_dir / "index.html")
        
        # Catch-all for SPA - must be last and exclude API routes
        @app.get("/{path:path}")
        async def serve_spa(path: str):
            if path.startswith("api/"):
                return JSONResponse({"detail": "Not found"}, status_code=404)
            file_path = frontend_dir / path
            if file_path.exists() and file_path.is_file():
                return FileResponse(file_path)
            return FileResponse(frontend_dir / "index.html")
    else:
        @app.get("/")
        async def root():
            return {
                "name": settings.app_name,
                "version": "0.1.0",
                "status": "running"
            }
    
    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

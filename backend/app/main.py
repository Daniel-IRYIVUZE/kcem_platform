"""app/main.py — EcoTrade Rwanda FastAPI application."""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base

# ── Import all models so SQLAlchemy can see them before create_all ──────────
import app.models.user          # noqa: F401
import app.models.hotel         # noqa: F401
import app.models.recycler      # noqa: F401
import app.models.driver        # noqa: F401
import app.models.listing       # noqa: F401
import app.models.bid           # noqa: F401
import app.models.collection    # noqa: F401
import app.models.route         # noqa: F401
import app.models.transaction   # noqa: F401
import app.models.notification  # noqa: F401
import app.models.message       # noqa: F401
import app.models.review        # noqa: F401
import app.models.inventory     # noqa: F401
import app.models.green_score   # noqa: F401
import app.models.audit_log     # noqa: F401
import app.models.system_settings  # noqa: F401
import app.models.blog          # noqa: F401
import app.models.support       # noqa: F401
import app.models.recycling     # noqa: F401

from app.routes import (
    auth, users, hotels, recyclers, drivers,
    listings, bids, collections, transactions,
    notifications, messages, reviews, inventory, admin,
)
from app.routes import blog
from app.routes import support
from app.routes import recycling
from app.routes import stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all database tables on startup
    Base.metadata.create_all(bind=engine)
    # Ensure upload directory exists
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    # Add any new columns that may not exist in older DB files
    _run_migrations()
    yield


def _run_migrations() -> None:
    """Apply lightweight column additions for DB files created before schema updates."""
    from sqlalchemy import text
    migrations = [
        "ALTER TABLE blog_posts ADD COLUMN author_display_name VARCHAR(150)",
    ]
    with engine.connect() as conn:
        for stmt in migrations:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass  # column already exists — safe to ignore


app = FastAPI(
    title="EcoTrade Rwanda API",
    description="Waste trading marketplace connecting hotels, recyclers and drivers in Rwanda.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static file serving for uploads ──────────────────────────────────────────
uploads_path = Path(settings.UPLOAD_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/api"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(hotels.router, prefix=API_PREFIX)
app.include_router(recyclers.router, prefix=API_PREFIX)
app.include_router(drivers.router, prefix=API_PREFIX)
app.include_router(listings.router, prefix=API_PREFIX)
app.include_router(bids.router, prefix=API_PREFIX)
app.include_router(collections.router, prefix=API_PREFIX)
app.include_router(transactions.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)
app.include_router(messages.router, prefix=API_PREFIX)
app.include_router(reviews.router, prefix=API_PREFIX)
app.include_router(inventory.router, prefix=API_PREFIX)
app.include_router(blog.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)
app.include_router(support.router, prefix=API_PREFIX)
app.include_router(recycling.router, prefix=API_PREFIX)
app.include_router(stats.router, prefix=API_PREFIX)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "EcoTrade Rwanda API", "version": "1.0.0"}

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
        "ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT 0",
        "ALTER TABLE hotels ADD COLUMN tin_number VARCHAR(100)",
        "ALTER TABLE recyclers ADD COLUMN tin_number VARCHAR(100)",
        "ALTER TABLE waste_listings ADD COLUMN qr_token VARCHAR(64)",
        "ALTER TABLE collections ADD COLUMN driver_fee REAL",
        "ALTER TABLE reviews ADD COLUMN reviewed_id INTEGER REFERENCES users(id)",
        "ALTER TABLE users ADD COLUMN notif_email BOOLEAN DEFAULT 1",
        "ALTER TABLE users ADD COLUMN notif_push BOOLEAN DEFAULT 1",
        "ALTER TABLE users ADD COLUMN notif_newsletter BOOLEAN DEFAULT 1",
    ]
    with engine.connect() as conn:
        for stmt in migrations:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass  # column already exists — safe to ignore

    # Make support_tickets.user_id nullable (for public/guest contact form tickets).
    # SQLite does not support ALTER COLUMN, so we recreate the table if the NOT NULL
    # constraint is still in place.
    with engine.connect() as conn:
        try:
            row = conn.execute(
                text("SELECT sql FROM sqlite_master WHERE type='table' AND name='support_tickets'")
            ).fetchone()
            if row and "NOT NULL" in (row[0] or "").upper() and "USER_ID" in (row[0] or "").upper():
                conn.execute(text("PRAGMA foreign_keys=OFF"))
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS support_tickets_new (
                        id         INTEGER PRIMARY KEY,
                        user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
                        subject    VARCHAR(255) NOT NULL,
                        message    TEXT NOT NULL,
                        status     VARCHAR(50)  DEFAULT 'open',
                        priority   VARCHAR(20)  DEFAULT 'medium',
                        created_at DATETIME,
                        updated_at DATETIME
                    )
                """))
                conn.execute(text(
                    "INSERT INTO support_tickets_new SELECT id,user_id,subject,message,status,priority,created_at,updated_at FROM support_tickets"
                ))
                conn.execute(text("DROP TABLE support_tickets"))
                conn.execute(text("ALTER TABLE support_tickets_new RENAME TO support_tickets"))
                conn.execute(text("PRAGMA foreign_keys=ON"))
                conn.commit()
        except Exception:
            pass  # Already migrated or table doesn't exist yet

    # Backfill driver_fee for existing completed collections that have no fee set.
    # Uses 10% of the linked transaction's gross_amount, or RWF 500/kg of actual_volume.
    with engine.connect() as conn:
        try:
            rows = conn.execute(text(
                "SELECT c.id, c.actual_volume, t.gross_amount "
                "FROM collections c LEFT JOIN transactions t ON t.collection_id = c.id "
                "WHERE c.status IN ('completed','verified') AND c.driver_id IS NOT NULL "
                "AND (c.driver_fee IS NULL OR c.driver_fee = 0)"
            )).fetchall()
            for row in rows:
                col_id, vol, gross = row[0], row[1] or 0.0, row[2] or 0.0
                fee = round(gross * 0.10, 2) if gross else round(vol * 500.0, 2)
                fee = max(fee, 500.0)
                conn.execute(
                    text("UPDATE collections SET driver_fee = :fee WHERE id = :id"),
                    {"fee": fee, "id": col_id},
                )
            if rows:
                conn.commit()
        except Exception:
            pass

    # Backfill qr_token for existing listings that have NULL (created before this feature)
    with engine.connect() as conn:
        try:
            import uuid as _uuid
            rows = conn.execute(text("SELECT id FROM waste_listings WHERE qr_token IS NULL")).fetchall()
            for row in rows:
                conn.execute(
                    text("UPDATE waste_listings SET qr_token = :token WHERE id = :id"),
                    {"token": str(_uuid.uuid4()), "id": row[0]},
                )
            if rows:
                conn.commit()
        except Exception:
            pass


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
# allow_origins=["*"] + allow_credentials=True is rejected by browsers for
# credentialed requests (Authorization header). Use explicit origins instead.
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

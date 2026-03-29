"""tests/conftest.py — shared fixtures for the EcoTrade test suite."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.user import User, UserRole, UserStatus
from app.auth.password import hash_password
from app.auth.jwt import create_access_token

# ── In-memory SQLite test DB ──────────────────────────────────────────────────
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    """Yield a fresh DB session; roll back after each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db):
    """Test client with DB dependency overridden."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()


# ── User factory helpers ──────────────────────────────────────────────────────

def make_user(db, *, email="test@example.com", password="password123",
              role=UserRole.business, status=UserStatus.active,
              full_name="Test User", phone="0788000001"):
    user = User(
        email=email,
        full_name=full_name,
        phone=phone,
        role=role,
        status=status,
        password_hash=hash_password(password),
        is_verified=True,
        is_email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def auth_headers(user: User, role: str | None = None) -> dict:
    token = create_access_token(subject=user.id, role=role or user.role.value)
    return {"Authorization": f"Bearer {token}"}


# ── Pre-built role fixtures ───────────────────────────────────────────────────

@pytest.fixture()
def admin_user(db):
    return make_user(db, email="admin@ecotrade.rw", role=UserRole.admin,
                     phone="0788000000", full_name="Admin User")

@pytest.fixture()
def business_user(db):
    return make_user(db, email="hotel@ecotrade.rw", role=UserRole.business,
                     phone="0788000002", full_name="Hotel Owner")

@pytest.fixture()
def recycler_user(db):
    return make_user(db, email="recycler@ecotrade.rw", role=UserRole.recycler,
                     phone="0788000003", full_name="Recycler User")

@pytest.fixture()
def driver_user(db):
    return make_user(db, email="driver@ecotrade.rw", role=UserRole.driver,
                     phone="0788000004", full_name="Driver User")

@pytest.fixture()
def admin_headers(admin_user):
    return auth_headers(admin_user)

@pytest.fixture()
def business_headers(business_user):
    return auth_headers(business_user)

@pytest.fixture()
def recycler_headers(recycler_user):
    return auth_headers(recycler_user)

@pytest.fixture()
def driver_headers(driver_user):
    return auth_headers(driver_user)

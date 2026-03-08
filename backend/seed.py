"""seed.py — Comprehensive database seeding for EcoTrade Rwanda."""
import sys
import os
from datetime import datetime, timedelta
import random

# Add backend directory to path so `app` package is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base

# Ensure all models are registered
import app.models.user
import app.models.hotel
import app.models.recycler
import app.models.driver
import app.models.listing
import app.models.bid
import app.models.collection
import app.models.route
import app.models.transaction
import app.models.notification
import app.models.message
import app.models.review
import app.models.inventory
import app.models.green_score
import app.models.audit_log
import app.models.system_settings

from app.models.user import User, UserRole, UserStatus
from app.models.hotel import Hotel
from app.models.recycler import Recycler
from app.models.driver import Driver, Vehicle, DriverStatus
from app.models.listing import WasteListing, WasteType, ListingStatus
from app.models.bid import Bid, BidStatus
from app.models.collection import Collection, CollectionStatus
from app.models.inventory import InventoryItem
from app.models.green_score import GreenScore
from app.models.notification import Notification, NotificationType
from app.auth.password import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()


def _make_user(email, full_name, role, password="Password123!", phone=None):
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(
        email=email,
        full_name=full_name,
        password_hash=hash_password(password),
        role=UserRole[role],
        status=UserStatus.active,
        is_email_verified=True,
        phone=phone,
    )
    db.add(user)
    db.flush()
    return user


print("🌱  Seeding EcoTrade Rwanda database...")

# ── Users ─────────────────────────────────────────────────────────────────────
print("  → Creating users...")
admin_user = _make_user("admin@ecotrade.rw", "System Admin", "admin", phone="+250788000000")

# Hotels (10 users)
hotels_data = [
    ("hotel@kigali.rw",        "Kigali Serena Hotel", "+250788111001"),
    ("radisson@kigali.rw",     "Radisson Blu Kigali", "+250788111002"),
    ("marriott@kigali.rw",     "Kigali Marriott Hotel", "+250788111003"),
    ("hilton@kigali.rw",       "Kigali Hilton Garden Inn", "+250788111004"),
    ("lemigo@kigali.rw",       "Hotel Lemigo", "+250788111005"),
    ("heaven@kigali.rw",       "Heaven Restaurant & Boutique Hotel", "+250788111006"),
    ("novotel@kigali.rw",      "Novotel Kigali", "+250788111007"),
    ("mille@kigali.rw",        "Hotel des Mille Collines", "+250788111008"),
    ("park@kigali.rw",         "Park Inn by Radisson", "+250788111009"),
    ("retreat@kigali.rw",      "Kigali Mountain View Retreat", "+250788111010"),
]
hotel_users = [_make_user(email, name, "business", phone=phone) for email, name, phone in hotels_data]

# Recyclers (10 users)
recycler_data = [
    ("recycler@greencycle.rw",  "GreenCycle Rwanda", "+250788222001"),
    ("recycler@ecolink.rw",     "EcoLink Africa", "+250788222002"),
    ("recycler@wastemaster.rw", "WasteMasters Ltd", "+250788222003"),
    ("recycler@cleanrw.rw",     "CleanRwanda Recycling", "+250788222004"),
    ("recycler@ecotrans.rw",    "EcoTransform Industries", "+250788222005"),
    ("recycler@greenplus.rw",   "GreenPlus Recyclers", "+250788222006"),
    ("recycler@nature.rw",      "Nature's Best Recycling", "+250788222007"),
    ("recycler@plastic.rw",     "Plastic Revolution Rwanda", "+250788222008"),
    ("recycler@global.rw",      "Global Waste Solutions", "+250788222009"),
    ("recycler@renewable.rw",   "Renewable Resources RW", "+250788222010"),
]
recycler_users = [_make_user(email, name, "recycler", phone=phone) for email, name, phone in recycler_data]

# Drivers (15 users - distributed among recyclers)
drivers_data = [
    ("driver1@greencycle.rw",  "Jean-Pierre Nkurunziza", "+250788333001"),
    ("driver2@greencycle.rw",  "Eric Habimana", "+250788333002"),
    ("driver1@ecolink.rw",     "Samuel Mugisha", "+250788333003"),
    ("driver2@ecolink.rw",     "David Uwizeye", "+250788333004"),
    ("driver1@wastemaster.rw", "Patrick Kamanzi", "+250788333005"),
    ("driver2@wastemaster.rw", "Emmanuel Byiringiro", "+250788333006"),
    ("driver1@cleanrw.rw",     "Claude Ndayisaba", "+250788333007"),
    ("driver1@ecotrans.rw",    "Joseph Bizimana", "+250788333008"),
    ("driver1@greenplus.rw",   "Felix Nsengimana", "+250788333009"),
    ("driver2@greenplus.rw",   "Martin Kayitesi", "+250788333010"),
    ("driver1@nature.rw",      "Frank Tuyishime", "+250788333011"),
    ("driver1@plastic.rw",     "Paul Niyonzima", "+250788333012"),
    ("driver1@global.rw",      "Robert Hakizimana", "+250788333013"),
    ("driver2@global.rw",      "Daniel Manzi", "+250788333014"),
    ("driver1@renewable.rw",   "Vincent Nsabimana", "+250788333015"),
]
driver_users = [_make_user(email, name, "driver", phone=phone) for email, name, phone in drivers_data]

# Individuals (5 users)
individual_data = [
    ("individual1@example.com", "Alice Uwimana", "+250788444001"),
    ("individual2@example.com", "Marie Mukandutiye", "+250788444002"),
    ("individual3@example.com", "Grace Umurerwa", "+250788444003"),
    ("individual4@example.com", "Christine Ingabire", "+250788444004"),
    ("individual5@example.com", "Beatrice Nyirahabimana", "+250788444005"),
]
individual_users = [_make_user(email, name, "individual", phone=phone) for email, name, phone in individual_data]

db.commit()
print(f"  ✓ {db.query(User).count()} users created")

# ── Hotel Profiles ─────────────────────────────────────────────────────────────
print("  → Creating hotel profiles...")


def _hotel(user, name, city, address, phone, stars):
    h = db.query(Hotel).filter(Hotel.user_id == user.id).first()
    if h:
        return h
    h = Hotel(user_id=user.id, hotel_name=name, city=city, address=address,
              phone=phone, stars=stars, business_name=name)
    db.add(h)
    db.flush()
    return h


hotel_profiles_data = [
    (0, "Kigali Serena Hotel", "Kigali", "KN 3 Ave, Kigali", "+250788111001", 5),
    (1, "Radisson Blu Kigali", "Kigali", "KG 2 Roundabout, Kigali", "+250788111002", 5),
    (2, "Kigali Marriott Hotel", "Kigali", "KN 3 Ave, Nyarugenge", "+250788111003", 5),
    (3, "Kigali Hilton Garden Inn", "Kigali", "KG 7 Ave, Kimihurura", "+250788111004", 4),
    (4, "Hotel Lemigo", "Kigali", "KG 624 St, Kacyiru", "+250788111005", 4),
    (5, "Heaven Restaurant & Boutique Hotel", "Kigali", "KG 541 St, Kimihurura", "+250788111006", 4),
    (6, "Novotel Kigali", "Kigali", "Blvd de l'Umuganda", "+250788111007", 4),
    (7, "Hotel des Mille Collines", "Kigali", "2 KN 6 Ave, Kacyiru", "+250788111008", 5),
    (8, "Park Inn by Radisson", "Kigali", "KG 2 Roundabout, Kiyovu", "+250788111009", 4),
    (9, "Kigali Mountain View Retreat", "Kigali", "Kimironko", "+250788111010", 3),
]

hotels = []
for idx, name, city, address, phone, stars in hotel_profiles_data:
    hotels.append(_hotel(hotel_users[idx], name, city, address, phone, stars))

db.commit()
print(f"  ✓ {len(hotels)} hotel profiles")

# ── Recycler Profiles ──────────────────────────────────────────────────────────
print("  → Creating recycler profiles...")


def _recycler(user, name, reg_no, city, capacity, waste_types):
    r = db.query(Recycler).filter(Recycler.user_id == user.id).first()
    if r:
        return r
    r = Recycler(
        user_id=user.id,
        company_name=name,
        license_number=reg_no,
        address=f"{city}, Rwanda",
        city=city,
        storage_capacity=capacity,
        waste_types_handled=waste_types,
        is_verified=True
    )
    db.add(r)
    db.flush()
    return r


recycler_profiles_data = [
    (0, "GreenCycle Rwanda", "RC-001", "Kigali", 5000.0, ["uco", "glass", "plastic"]),
    (1, "EcoLink Africa", "RC-002", "Kigali", 8000.0, ["plastic", "paper_cardboard", "metal"]),
    (2, "WasteMasters Ltd", "RC-003", "Kigali", 6000.0, ["organic", "plastic", "paper_cardboard"]),
    (3, "CleanRwanda Recycling", "RC-004", "Kigali", 7500.0, ["glass", "metal", "plastic"]),
    (4, "EcoTransform Industries", "RC-005", "Kigali", 10000.0, ["uco", "organic", "plastic"]),
    (5, "GreenPlus Recyclers", "RC-006", "Kigali", 4500.0, ["paper_cardboard", "glass"]),
    (6, "Nature's Best Recycling", "RC-007", "Musanze", 5500.0, ["organic", "paper_cardboard"]),
    (7, "Plastic Revolution Rwanda", "RC-008", "Kigali", 9000.0, ["plastic", "glass"]),
    (8, "Global Waste Solutions", "RC-009", "Kigali", 12000.0, ["all"]),
    (9, "Renewable Resources RW", "RC-010", "Huye", 6500.0, ["uco", "plastic", "organic"]),
]

recyclers = []
for idx, name, reg_no, city, capacity, waste_types in recycler_profiles_data:
    recyclers.append(_recycler(recycler_users[idx], name, reg_no, city, capacity, waste_types))

db.commit()
print(f"  ✓ {len(recyclers)} recycler profiles")

# ── Drivers & Vehicles ─────────────────────────────────────────────────────────
print("  → Creating drivers and vehicles...")

# Assign drivers to recyclers
driver_assignments = [
    (0, 0),  # Driver 0 → Recycler 0 (GreenCycle)
    (1, 0),  # Driver 1 → Recycler 0
    (2, 1),  # Driver 2 → Recycler 1 (EcoLink)
    (3, 1),  # Driver 3 → Recycler 1
    (4, 2),  # Driver 4 → Recycler 2 (WasteMasters)
    (5, 2),  # Driver 5 → Recycler 2
    (6, 3),  # Driver 6 → Recycler 3 (CleanRwanda)
    (7, 4),  # Driver 7 → Recycler 4 (EcoTransform)
    (8, 5),  # Driver 8 → Recycler 5 (GreenPlus)
    (9, 5),  # Driver 9 → Recycler 5
    (10, 6), # Driver 10 → Recycler 6 (Nature's Best)
    (11, 7), # Driver 11 → Recycler 7 (Plastic Revolution)
    (12, 8), # Driver 12 → Recycler 8 (Global)
    (13, 8), # Driver 13 → Recycler 8
    (14, 9), # Driver 14 → Recycler 9 (Renewable)
]

vehicles_data = [
    ("Truck", "Toyota", "Hilux", 2021, "RAB 123 A", 1500.0),
    ("Truck", "Isuzu", "D-Max", 2020, "RAB 124 B", 1800.0),
    ("Truck", "Mitsubishi", "L200", 2021, "RAB 125 C", 1600.0),
    ("Truck", "Ford", "Ranger", 2022, "RAB 126 D", 1700.0),
    ("Truck", "Toyota", "Land Cruiser", 2019, "RAB 127 E", 2000.0),
    ("Van", "Mercedes", "Sprinter", 2020, "RAB 128 F", 1200.0),
    ("Truck", "Nissan", "Navara", 2021, "RAB 129 G", 1500.0),
    ("Truck", "Toyota", "Hilux", 2022, "RAB 130 H", 1500.0),
    ("Van", "Volkswagen", "Transporter", 2020, "RAB 131 I", 1000.0),
    ("Truck", "Isuzu", "NPR", 2021, "RAB 132 J", 2500.0),
    ("Truck", "Toyota", "Dyna", 2019, "RAB 133 K", 2200.0),
    ("Van", "Ford", "Transit", 2020, "RAB 134 L", 1100.0),
    ("Truck", "Mitsubishi", "Canter", 2021, "RAB 135 M", 3000.0),
    ("Truck", "Hino", "300", 2022, "RAB 136 N", 3500.0),
    ("Truck", "Toyota", "Hilux", 2020, "RAB 137 O", 1500.0),
]

drivers = []
for driver_idx, recycler_idx in driver_assignments:
    if not db.query(Driver).filter(Driver.user_id == driver_users[driver_idx].id).first():
        vtype, make, model, year, plate, capacity = vehicles_data[driver_idx]
        
        # Create vehicle
        vehicle = Vehicle(
            recycler_id=recyclers[recycler_idx].id,
            vehicle_type=vtype,
            make=make,
            model=model,
            year=year,
            plate_number=plate,
            capacity_kg=capacity
        )
        db.add(vehicle)
        db.flush()
        
        # Create driver
        driver = Driver(
            user_id=driver_users[driver_idx].id,
            recycler_id=recyclers[recycler_idx].id,
            license_number=f"DL-RW-{10000 + driver_idx}",
            status=DriverStatus.available,
            vehicle_id=vehicle.id
        )
        db.add(driver)
        drivers.append(driver)

db.commit()
print(f"  ✓ {len(drivers)} drivers + {len(drivers)} vehicles")

# ── Waste Listings ────────────────────────────────────────────────────────────
        bid_count += 1
    if not db.query(Bid).filter(Bid.listing_id == listing.id, Bid.recycler_id == ecolink.id).first():
        b = Bid(listing_id=listing.id, recycler_id=ecolink.id,
                amount=listing.min_bid * 0.95, status=BidStatus.active,
                notes="EcoLink Africa — certified recycler.")
        db.add(b)
        bid_count += 1
db.commit()
print(f"  ✓ {bid_count} bids")

# ── Inventory ─────────────────────────────────────────────────────────────────
inv_data = [
    (greencycle.id, WasteType.uco, 2500.0, "litres"),
    (greencycle.id, WasteType.glass, 800.0, "kg"),
    (ecolink.id,    WasteType.plastic, 5000.0, "kg"),
    (ecolink.id,    WasteType.paper_cardboard, 3000.0, "kg"),
]
for rec_id, wtype, qty, unit in inv_data:
    if not db.query(InventoryItem).filter(InventoryItem.recycler_id == rec_id,
                                          InventoryItem.material_type == wtype.value).first():
        db.add(InventoryItem(recycler_id=rec_id, material_type=wtype.value,
                             current_stock=qty, unit=unit))
db.commit()
print("  ✓ inventory items")

db.close()
print("\n✅  Seed complete! Run: uvicorn app.main:app --reload")
print("   API docs: http://localhost:8000/api/docs")
print("\n   Demo credentials (all use password: Password123!)")
print("   admin@ecotrade.rw     — Admin")
print("   hotel@kigali.rw       — Hotel (business)")
print("   recycler@greencycle.rw — Recycler")
print("   driver@greencycle.rw  — Driver")
print("   individual@example.com — Individual")

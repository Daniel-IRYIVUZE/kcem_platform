"""
seed.py — Populate the EcoTrade Rwanda database with demo data.

Run from the backend/ directory:
    python seed.py

Idempotent: skips entities that already exist (matched by email / unique fields).
"""
import json
from datetime import datetime, timedelta
from database import SessionLocal, Base, engine
import models
from utils.security import hash_password

Base.metadata.create_all(bind=engine)


def get_or_create_user(db, email, **kwargs):
    u = db.query(models.User).filter(models.User.email == email).first()
    if u:
        return u, False
    u = models.User(email=email, **kwargs)
    db.add(u)
    db.flush()
    return u, True


def seed():
    db = SessionLocal()
    try:
        print("🌱 Seeding demo data...")

        # ── Admin ─────────────────────────────────────────────────────────────
        admin, created = get_or_create_user(
            db,
            email="admin@ecotrade.rw",
            full_name="Admin User",
            phone="+250788000001",
            hashed_password=hash_password("admin123"),
            role=models.UserRole.admin,
            status=models.UserStatus.active,
            is_verified=True,
            latitude=-1.9441,
            longitude=30.0619,
        )
        if created:
            print("  ✓ Admin user created")

        # ── Hotel 1: Mille Collines ────────────────────────────────────────────
        hotel1, created = get_or_create_user(
            db,
            email="hotel@millecollines.rw",
            full_name="Mille Collines Hotel",
            phone="+250788111111",
            hashed_password=hash_password("hotel123"),
            role=models.UserRole.hotel,
            status=models.UserStatus.active,
            is_verified=True,
            latitude=-1.9493,
            longitude=30.0588,
            location="Nyarugenge, Kigali",
        )
        if created:
            db.add(models.HotelProfile(
                user_id=hotel1.id,
                business_name="Mille Collines Hotel",
                registration_number="RDB2024001",
                tax_id="TAX001234",
                contact_person="Jean Karambizi",
                position="Operations Manager",
                green_score=82.5,
                monthly_waste=450.0,
                total_revenue=1250000.0,
            ))
            print("  ✓ Hotel 1 (Mille Collines) created")

        # ── Hotel 2: Marriott ─────────────────────────────────────────────────
        hotel2, created = get_or_create_user(
            db,
            email="hotel2@marriott.rw",
            full_name="Marriott Kigali",
            phone="+250788222222",
            hashed_password=hash_password("hotel123"),
            role=models.UserRole.hotel,
            status=models.UserStatus.active,
            is_verified=True,
            latitude=-1.9411,
            longitude=30.0619,
            location="Gasabo, Kigali",
        )
        if created:
            db.add(models.HotelProfile(
                user_id=hotel2.id,
                business_name="Marriott Kigali",
                registration_number="RDB2024002",
                contact_person="Alice Uwimana",
                position="Sustainability Manager",
                green_score=91.0,
                monthly_waste=680.0,
                total_revenue=2800000.0,
            ))
            print("  ✓ Hotel 2 (Marriott) created")

        # ── Recycler 1 ────────────────────────────────────────────────────────
        recycler1, created = get_or_create_user(
            db,
            email="recycler@greenenergy.rw",
            full_name="GreenEnergy Recyclers",
            phone="+250788333333",
            hashed_password=hash_password("recycler123"),
            role=models.UserRole.recycler,
            status=models.UserStatus.active,
            is_verified=True,
            latitude=-1.9300,
            longitude=30.0750,
            location="Kicukiro, Kigali",
        )
        if created:
            db.add(models.RecyclerProfile(
                user_id=recycler1.id,
                company_name="GreenEnergy Recyclers",
                license_number="REMA/LIC/2024/001",
                waste_types=json.dumps(["UCO", "Glass", "Paper"]),
                facility_address="Kicukiro Industrial Zone, Kigali",
                processing_capacity=50.0,
                service_radius=20.0,
                operating_hours="07:00-18:00",
                rating=4.7,
                total_revenue=5600000.0,
            ))
            print("  ✓ Recycler 1 (GreenEnergy) created")

        # ── Recycler 2 ────────────────────────────────────────────────────────
        recycler2, created = get_or_create_user(
            db,
            email="recycler2@ecofuture.rw",
            full_name="EcoFuture Ltd",
            phone="+250788444444",
            hashed_password=hash_password("recycler123"),
            role=models.UserRole.recycler,
            status=models.UserStatus.active,
            is_verified=True,
            latitude=-1.9650,
            longitude=30.0520,
            location="Nyarugenge, Kigali",
        )
        if created:
            db.add(models.RecyclerProfile(
                user_id=recycler2.id,
                company_name="EcoFuture Ltd",
                license_number="REMA/LIC/2024/002",
                waste_types=json.dumps(["Paper", "Cardboard", "Plastics"]),
                processing_capacity=80.0,
                service_radius=15.0,
                rating=4.4,
            ))
            print("  ✓ Recycler 2 (EcoFuture) created")

        # ── Driver ────────────────────────────────────────────────────────────
        driver1, created = get_or_create_user(
            db,
            email="driver@ecotrade.rw",
            full_name="Jean Pierre Habimana",
            phone="+250788555555",
            hashed_password=hash_password("driver123"),
            role=models.UserRole.driver,
            status=models.UserStatus.active,
            is_verified=True,
            latitude=-1.9460,
            longitude=30.0660,
        )
        if created:
            db.add(models.DriverProfile(
                user_id=driver1.id,
                national_id="1199880012345678",
                vehicle_type="pickup",
                vehicle_plate="RAC 123 A",
                service_radius=25.0,
                operating_hours="06:00-20:00",
                rating=4.9,
                completed_routes=47,
                total_earnings=820000.0,
            ))
            print("  ✓ Driver 1 (Jean Pierre) created")

        # ── Individual user ───────────────────────────────────────────────────
        individual1, created = get_or_create_user(
            db,
            email="individual@ecotrade.rw",
            full_name="Marie Claire Uwase",
            phone="+250788666666",
            hashed_password=hash_password("user123"),
            role=models.UserRole.individual,
            status=models.UserStatus.active,
            is_verified=True,
        )
        if created:
            print("  ✓ Individual user (Marie Claire) created")

        # Pending user (not yet approved)
        pending, created = get_or_create_user(
            db,
            email="pending@hotel.rw",
            full_name="Serena Hotel Kigali",
            phone="+250788777777",
            hashed_password=hash_password("hotel123"),
            role=models.UserRole.hotel,
            status=models.UserStatus.pending,
            is_verified=False,
            latitude=-1.9541,
            longitude=30.0612,
        )
        if created:
            db.add(models.HotelProfile(
                user_id=pending.id,
                business_name="Serena Hotel Kigali",
                registration_number="RDB2024010",
                contact_person="Peter Nkurunziza",
                position="GM",
            ))
            print("  ✓ Pending hotel (Serena) created")

        db.commit()

        # ── Waste Listings ────────────────────────────────────────────────────
        if not db.query(models.WasteListing).first():
            listings_data = [
                dict(hotel_id=hotel1.id, hotel_name="Mille Collines Hotel", waste_type="UCO",
                     volume=50.0, unit="liters", quality="A", min_bid=15000.0, reserve_price=20000.0,
                     auction_duration="24h", contact_person="Jean Karambizi",
                     location="Nyarugenge, Kigali", status=models.ListingStatus.open,
                     expires_at=datetime.utcnow() + timedelta(hours=20)),
                dict(hotel_id=hotel1.id, hotel_name="Mille Collines Hotel", waste_type="Glass",
                     volume=80.0, unit="kg", quality="A", min_bid=3500.0,
                     auction_duration="48h", contact_person="Jean Karambizi",
                     location="Nyarugenge, Kigali", status=models.ListingStatus.open,
                     expires_at=datetime.utcnow() + timedelta(hours=44)),
                dict(hotel_id=hotel2.id, hotel_name="Marriott Kigali", waste_type="UCO",
                     volume=120.0, unit="liters", quality="A", min_bid=35000.0, reserve_price=45000.0,
                     auction_duration="24h", contact_person="Alice Uwimana",
                     location="Gasabo, Kigali", status=models.ListingStatus.open,
                     expires_at=datetime.utcnow() + timedelta(hours=18)),
                dict(hotel_id=hotel2.id, hotel_name="Marriott Kigali", waste_type="Paper/Cardboard",
                     volume=200.0, unit="kg", quality="B", min_bid=12000.0,
                     auction_duration="72h", contact_person="Alice Uwimana",
                     location="Gasabo, Kigali", status=models.ListingStatus.assigned,
                     assigned_recycler="EcoFuture Ltd",
                     expires_at=datetime.utcnow() + timedelta(hours=68)),
            ]
            listings = []
            for ld in listings_data:
                l = models.WasteListing(**ld)
                db.add(l)
                listings.append(l)
            db.flush()
            print(f"  ✓ {len(listings)} waste listings created")

            # Bids on listing 1 and 3
            if len(listings) >= 1:
                db.add(models.Bid(listing_id=listings[0].id, recycler_id=recycler1.id,
                                  recycler_name="GreenEnergy Recyclers", amount=17500.0,
                                  note="Can collect tomorrow morning", status=models.BidStatus.active))
                db.add(models.Bid(listing_id=listings[0].id, recycler_id=recycler2.id,
                                  recycler_name="EcoFuture Ltd", amount=16000.0,
                                  status=models.BidStatus.active))
            if len(listings) >= 3:
                db.add(models.Bid(listing_id=listings[2].id, recycler_id=recycler1.id,
                                  recycler_name="GreenEnergy Recyclers", amount=42000.0,
                                  note="Premium UCO pickup", status=models.BidStatus.active))

            db.commit()
            print("  ✓ Bids created")

        # ── Driver Route ──────────────────────────────────────────────────────
        if not db.query(models.DriverRoute).first():
            route = models.DriverRoute(
                driver_id=driver1.id,
                date=datetime.utcnow().strftime("%Y-%m-%d"),
                status=models.RouteStatus.in_progress,
                total_distance=12.5,
                estimated_earnings=15000.0,
                start_time="08:00",
            )
            db.add(route)
            db.flush()

            stops_data = [
                dict(hotel_name="Mille Collines Hotel", location="Nyarugenge", waste_type="UCO",
                     volume=50.0, eta="09:00", status=models.StopStatus.completed,
                     contact_person="Jean Karambizi", contact_phone="+250788111111",
                     actual_weight=48.5, completed_at=datetime.utcnow() - timedelta(hours=1)),
                dict(hotel_name="Marriott Kigali", location="Gasabo", waste_type="Glass",
                     volume=80.0, eta="10:30", status=models.StopStatus.collecting,
                     contact_person="Alice Uwimana", contact_phone="+250788222222"),
                dict(hotel_name="Serena Hotel", location="Nyarugenge", waste_type="Paper",
                     volume=150.0, eta="12:00", status=models.StopStatus.pending,
                     contact_person="Peter Nkurunziza", contact_phone="+250788777777"),
            ]
            for sd in stops_data:
                db.add(models.RouteStop(route_id=route.id, **sd))

            db.commit()
            print("  ✓ Driver route with 3 stops created")

        # ── Recycling Events ──────────────────────────────────────────────────
        if not db.query(models.RecyclingEvent).first():
            events = [
                models.RecyclingEvent(user_id=hotel1.id, user_name="Mille Collines Hotel",
                                      date="2026-02-28", waste_type="UCO", weight=48.5,
                                      location="Nyarugenge", points=97, verified=True),
                models.RecyclingEvent(user_id=hotel2.id, user_name="Marriott Kigali",
                                      date="2026-02-25", waste_type="Glass", weight=95.0,
                                      location="Gasabo", points=190, verified=True),
                models.RecyclingEvent(user_id=hotel2.id, user_name="Marriott Kigali",
                                      date="2026-02-20", waste_type="Paper", weight=200.0,
                                      location="Gasabo", points=200, verified=False),
            ]
            for e in events:
                db.add(e)
            db.commit()
            print("  ✓ Recycling events created")

        # ── Support Tickets ───────────────────────────────────────────────────
        if not db.query(models.SupportTicket).first():
            t1 = models.SupportTicket(user_id=hotel1.id, user_name="Mille Collines Hotel",
                                      subject="Cannot list UCO — form error",
                                      message="When I try to submit a listing the page refreshes without saving.",
                                      status=models.TicketStatus.open, priority=models.TicketPriority.high)
            db.add(t1)
            db.flush()
            db.add(models.TicketResponse(ticket_id=t1.id, from_name="EcoTrade Support",
                                         message="Thanks for reporting! We're looking into this. Please clear your browser cache and try again."))
            db.commit()
            print("  ✓ Support tickets created")

        # ── Audit Logs ────────────────────────────────────────────────────────
        if not db.query(models.AuditLog).first():
            logs = [
                models.AuditLog(admin_user_id=admin.id, admin_name="Admin User",
                                action=models.AuditAction.create, target="User",
                                details="Approved Mille Collines Hotel account", status="success"),
                models.AuditLog(admin_user_id=admin.id, admin_name="Admin User",
                                action=models.AuditAction.update, target="WasteListing",
                                details="Manually assigned listing #4 to EcoFuture Ltd", status="success"),
            ]
            for l in logs:
                db.add(l)
            db.commit()
            print("  ✓ Audit logs created")

        print("\n✅ Seeding complete! Demo credentials:")
        print("   Admin:      admin@ecotrade.rw / admin123")
        print("   Hotel:      hotel@millecollines.rw / hotel123")
        print("   Recycler:   recycler@greenenergy.rw / recycler123")
        print("   Driver:     driver@ecotrade.rw / driver123")
        print("   Individual: individual@ecotrade.rw / user123")
        print("\n   Run the API: uvicorn main:app --reload --port 8000")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()

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
from app.models.blog import BlogPost
from app.auth.password import hash_password

# Delete existing database and recreate
if os.path.exists("ecotrade.db"):
    os.remove("ecotrade.db")
    
Base.metadata.create_all(bind=engine)

db = SessionLocal()


def _make_user(email, full_name, role, password="Password123!", phone=None):
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


print("🌱  Seeding EcoTrade Rwanda database with comprehensive test data...")

# ── Users ─────────────────────────────────────────────────────────────────────
print("  → Creating users...")
admin_user = _make_user("admin@ecotrade.rw", "System Admin", "admin", phone="+250788000000")

# Hotels (10 users)
hotels_data = [
    ("hotel@kigali.rw", "Kigali Serena Hotel", "+250788111001"),
    ("radisson@kigali.rw", "Radisson Blu Kigali", "+250788111002"),
    ("marriott@kigali.rw", "Kigali Marriott Hotel", "+250788111003"),
    ("hilton@kigali.rw", "Kigali Hilton Garden Inn", "+250788111004"),
    ("lemigo@kigali.rw", "Hotel Lemigo", "+250788111005"),
    ("heaven@kigali.rw", "Heaven Restaurant & Boutique Hotel", "+250788111006"),
    ("novotel@kigali.rw", "Novotel Kigali", "+250788111007"),
    ("mille@kigali.rw", "Hotel des Mille Collines", "+250788111008"),
    ("park@kigali.rw", "Park Inn by Radisson", "+250788111009"),
    ("retreat@kigali.rw", "Kigali Mountain View Retreat", "+250788111010"),
]
hotel_users = [_make_user(email, name, "business", phone=phone) for email, name, phone in hotels_data]

# Recyclers (10 users)
recycler_data = [
    ("recycler@greencycle.rw", "GreenCycle Rwanda", "+250788222001"),
    ("recycler@ecolink.rw", "EcoLink Africa", "+250788222002"),
    ("recycler@wastemaster.rw", "WasteMasters Ltd", "+250788222003"),
    ("recycler@cleanrw.rw", "CleanRwanda Recycling", "+250788222004"),
    ("recycler@ecotrans.rw", "EcoTransform Industries", "+250788222005"),
    ("recycler@greenplus.rw", "GreenPlus Recyclers", "+250788222006"),
    ("recycler@nature.rw", "Nature's Best Recycling", "+250788222007"),
    ("recycler@plastic.rw", "Plastic Revolution Rwanda", "+250788222008"),
    ("recycler@global.rw", "Global Waste Solutions", "+250788222009"),
    ("recycler@renewable.rw", "Renewable Resources RW", "+250788222010"),
]
recycler_users = [_make_user(email, name, "recycler", phone=phone) for email, name, phone in recycler_data]

# Drivers (15 users)
drivers_data = [
    ("driver1@greencycle.rw", "Jean-Pierre Nkurunziza", "+250788333001"),
    ("driver2@greencycle.rw", "Eric Habimana", "+250788333002"),
    ("driver1@ecolink.rw", "Samuel Mugisha", "+250788333003"),
    ("driver2@ecolink.rw", "David Uwizeye", "+250788333004"),
    ("driver1@wastemaster.rw", "Patrick Kamanzi", "+250788333005"),
    ("driver2@wastemaster.rw", "Emmanuel Byiringiro", "+250788333006"),
    ("driver1@cleanrw.rw", "Claude Ndayisaba", "+250788333007"),
    ("driver1@ecotrans.rw", "Joseph Bizimana", "+250788333008"),
    ("driver1@greenplus.rw", "Felix Nsengimana", "+250788333009"),
    ("driver2@greenplus.rw", "Martin Kayitesi", "+250788333010"),
    ("driver1@nature.rw", "Frank Tuyishime", "+250788333011"),
    ("driver1@plastic.rw", "Paul Niyonzima", "+250788333012"),
    ("driver1@global.rw", "Robert Hakizimana", "+250788333013"),
    ("driver2@global.rw", "Daniel Manzi", "+250788333014"),
    ("driver1@renewable.rw", "Vincent Nsabimana", "+250788333015"),
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
    h = Hotel(
        user_id=hotel_users[idx].id,
        hotel_name=name,
        city=city,
        address=address,
        phone=phone,
        stars=stars
    )
    db.add(h)
    hotels.append(h)
    db.flush()

db.commit()
print(f"  ✓ {len(hotels)} hotel profiles")

# ── Recycler Profiles ──────────────────────────────────────────────────────────
print("  → Creating recycler profiles...")

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
    r = Recycler(
        user_id=recycler_users[idx].id,
        company_name=name,
        license_number=reg_no,
        address=f"{city}, Rwanda",
        city=city,
        storage_capacity=capacity,
        waste_types_handled=",".join(waste_types),  # Convert list to comma-separated string
        is_verified=True
    )
    db.add(r)
    recyclers.append(r)
    db.flush()

db.commit()
print(f"  ✓ {len(recyclers)} recycler profiles")

# ── Drivers & Vehicles ─────────────────────────────────────────────────────────
print("  → Creating drivers and vehicles...")

driver_assignments = [
    (0, 0), (1, 0), (2, 1), (3, 1), (4, 2), (5, 2), (6, 3), (7, 4),
    (8, 5), (9, 5), (10, 6), (11, 7), (12, 8), (13, 8), (14, 9),
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
print("  → Creating waste listings...")

listing_templates = [
    ("Used Cooking Oil Collection", WasteType.uco, "Weekly UCO from kitchen operations.", 300, 800),
    ("Glass Bottles - Mixed", WasteType.glass, "Clean glass bottles from bar and restaurant.", 100, 500),
    ("Cardboard & Paper Waste", WasteType.paper_cardboard, "Packaging materials and office waste.", 200, 1200),
    ("Plastic Waste Collection", WasteType.plastic, "Mixed plastic from guest rooms and kitchen.", 150, 600),
    ("Organic Kitchen Waste", WasteType.organic, "Daily organic waste from food preparation.", 500, 1500),
    ("Metal Cans & Containers", WasteType.metal, "Aluminum and steel containers.", 50, 300),
]

listings = []
for hotel_idx in range(min(8, len(hotels))):  # Create listings for first 8 hotels
    for template_idx, (title, wtype, desc, min_vol, max_vol) in enumerate(listing_templates):
        if random.random() < 0.6:  # 60% chance to create each listing type
            volume = random.uniform(min_vol, max_vol)
            min_bid = volume * random.uniform(0.5, 2.5)  # RWF per kg/L
            
            hotel_obj = hotels[hotel_idx]
            listing = WasteListing(
                hotel_id=hotel_obj.id,
                title=f"{title} - {hotel_obj.hotel_name}",
                waste_type=wtype,
                volume=volume,
                min_bid=min_bid,
                description=desc,
                status=ListingStatus.open,
                latitude=hotel_obj.latitude,
                longitude=hotel_obj.longitude,
                address=hotel_obj.address,
            )
            db.add(listing)
            listings.append(listing)

db.commit()
print(f"  ✓ {len(listings)} waste listings")

# ── Bids ──────────────────────────────────────────────────────────────────────
print("  → Creating bids...")

bids = []
for listing in listings[:20]:  # Create bids for first 20 listings
    num_bids = random.randint(1, 4)
    recycler_pool = random.sample(recyclers, min(num_bids, len(recyclers)))
    
    for recycler in recycler_pool:
        amount = listing.min_bid * random.uniform(0.85, 1.15)
        bid = Bid(
            listing_id=listing.id,
            recycler_id=recycler.id,
            amount=amount,
            status=BidStatus.active,
            notes=f"Competitive bid from {recycler.company_name}"
        )
        db.add(bid)
        bids.append(bid)

db.commit()
print(f"  ✓ {len(bids)} bids")

# ── Inventory Items ───────────────────────────────────────────────────────────
print("  → Creating recycler inventory...")

waste_types_list = [WasteType.uco, WasteType.glass, WasteType.plastic, 
                    WasteType.paper_cardboard, WasteType.organic, WasteType.metal]

inventory_count = 0
for recycler in recyclers:
    # Each recycler has 2-4 inventory items
    for wtype in random.sample(waste_types_list, random.randint(2, 4)):
        stock = random.uniform(100, 5000)
        item = InventoryItem(
            recycler_id=recycler.id,
            material_type=wtype.value,
            current_stock=stock,
            unit="kg" if wtype != WasteType.uco else "litres"
        )
        db.add(item)
        inventory_count += 1

db.commit()
print(f"  ✓ {inventory_count} inventory items")

# ── Green Scores ──────────────────────────────────────────────────────────────
print("  → Creating green scores...")

current_month = datetime.now().strftime("%Y-%m")

for hotel in hotels:
    score = GreenScore(
        user_id=hotel.user_id,
        period=current_month,
        waste_diverted=random.uniform(500, 10000),
        co2_saved=random.uniform(200, 5000),
        water_saved=random.uniform(1000, 50000),
        energy_saved=random.uniform(100, 2000),
        score=random.uniform(50, 95)
    )
    db.add(score)

for recycler in recyclers:
    score = GreenScore(
        user_id=recycler.user_id,
        period=current_month,
        waste_diverted=random.uniform(1000, 20000),
        co2_saved=random.uniform(500, 10000),
        water_saved=random.uniform(2000, 100000),
        energy_saved=random.uniform(200, 5000),
        score=random.uniform(60, 100)
    )
    db.add(score)

db.commit()
print("  ✓ green scores")

# ── Notifications ─────────────────────────────────────────────────────────────
print("  → Creating notifications...")

notification_count = 0
for hotel in hotels[:5]:  # First 5 hotels get notifications
    # Welcome notification
    notif = Notification(
        user_id=hotel.user_id,
        type=NotificationType.system,
        title="Welcome to EcoTrade Rwanda!",
        body="Start listing your waste and connect with recyclers in your area.",
        is_read=random.choice([True, False])
    )
    db.add(notif)
    notification_count += 1

for recycler in recyclers[:5]:  # First 5 recyclers get notifications
    notif = Notification(
        user_id=recycler.user_id,
        type=NotificationType.new_bid,
        title="New Listing Available",
        body="A new waste listing matching your profile is available for bidding.",
        is_read=random.choice([True, False])
    )
    db.add(notif)
    notification_count += 1

db.commit()
print(f"  ✓ {notification_count} notifications")

# ── Blog Posts ────────────────────────────────────────────────────────────────
print("  → Creating blog posts...")

blog_posts_data = [
    {
        "title": "Rwanda's Journey to Becoming Africa's Green Leader",
        "slug": "rwanda-green-leader-africa",
        "category": "sustainability",
        "excerpt": "How Rwanda is transforming waste management and leading the continent in environmental conservation.",
        "content": """Rwanda has emerged as a beacon of environmental sustainability in Africa. Through innovative policies and strong government commitment, the nation has achieved remarkable progress in waste management and recycling.

The ban on plastic bags in 2008 was just the beginning. Today, Rwanda boasts one of the cleanest cities in Africa, with Kigali setting standards for urban environmental management. The EcoTrade platform is part of this vision, connecting hotels, recyclers, and drivers to create a circular economy.

Key achievements include:
- 90% waste collection coverage in urban areas
- Growing recycling industry creating thousands of jobs
- Integration of informal waste pickers into formal economy
- Public-private partnerships driving innovation

This transformation wouldn't be possible without the dedication of our partners and the Rwandan people's commitment to a cleaner, greener future.""",
        "tags": "rwanda,sustainability,green economy,waste management,africa",
        "is_published": True,
        "is_featured": True,
    },
    {
        "title": "The Economic Value of Used Cooking Oil Recycling",
        "slug": "ucovalue-recycling-biodiesel",
        "category": "recycling",
        "excerpt": "Discover how hotels can turn used cooking oil into a valuable commodity while protecting the environment.",
        "content": """Used Cooking Oil (UCO) is more than just waste—it's a valuable resource that can be converted into biodiesel, animal feed, and industrial products.

For hotels and restaurants in Rwanda, proper UCO management offers multiple benefits:

**Economic Benefits:**
- Generate revenue from waste that was previously a disposal cost
- Typical prices range from 400-800 RWF per liter
- Large hotels can collect 200-500 liters monthly
- Annual revenue potential of 1-4 million RWF

**Environmental Benefits:**
- Prevent FOG (Fats, Oils, Grease) blockages in sewers
- Reduce water pollution
- Lower carbon emissions through biodiesel production
- Each liter of UCO recycled saves 2.5kg of CO₂ emissions

**Best Practices:**
- Use dedicated collection containers
- Filter out food particles before storage
- Store in cool, dry locations
- Schedule regular pickups through EcoTrade

Join the growing number of hotels partnering with certified recyclers through our platform.""",
        "tags": "uco,recycling,biodiesel,hotels,revenue",
        "is_published": True,
        "is_featured": True,
    },
    {
        "title": "Success Story: Kigali Serena Hotel's Waste Reduction Journey",
        "slug": "serena-hotel-waste-success",
        "category": "case-study",
        "excerpt": "How one of Kigali's premier hotels achieved 70% waste diversion through strategic partnerships.",
        "content": """When Kigali Serena Hotel joined EcoTrade Rwanda six months ago, they were disposing of over 2 tons of waste monthly. Today, they've achieved a 70% diversion rate, generating revenue while significantly reducing their environmental impact.

**The Challenge:**
Like many luxury hotels, Serena faced rising waste disposal costs and growing pressure to demonstrate environmental responsibility to eco-conscious guests.

**The Solution:**
Through EcoTrade's platform, Serena connected with multiple certified recyclers:
- GreenCycle Rwanda for UCO collection
- EcoLink Africa for glass recycling
- WasteMasters for cardboard and paper

**The Results:**
- 1,200 liters of UCO collected monthly
- 800kg of glass recycled
- 500kg of cardboard diverted from landfills
- Monthly revenue of 980,000 RWF
- Green Score increased to 92/100
- Featured in international sustainability reports

**Guest Impact:**
Guest feedback has been overwhelmingly positive, with many citing the hotel's environmental initiatives as a factor in their booking decision.

"Joining EcoTrade was one of the best operational decisions we've made," says the Hotel Manager. "We're not just saving money—we're contributing to Rwanda's green vision while attracting environmentally conscious guests."

Ready to start your sustainability journey? Contact us today.""",
        "tags": "case study,hotels,success story,waste reduction,kigali",
        "is_published": True,
        "is_featured": True,
    },
    {
        "title": "Understanding Rwanda's Waste Hierarchy",
        "slug": "rwanda-waste-hierarchy-guide",
        "category": "sustainability",
        "excerpt": "A comprehensive guide to Rwanda's approach to waste management and the role of each stakeholder.",
        "content": """Rwanda follows the internationally recognized waste hierarchy, prioritizing prevention, reuse, recycling, recovery, and finally disposal.

**1. Prevention:**
The most effective form of waste management. Hotels can reduce waste by:
- Choosing products with minimal packaging
- Implementing portion control
- Training staff on waste-conscious practices

**2. Reuse:**
Extending product life before it becomes waste:
- Returnable packaging systems
- Donation programs for usable items
- Creative repurposing initiatives

**3. Recycling:**
Converting waste into new materials:
- Glass, plastic, paper, metal separation
- UCO collection for biodiesel
- Organic waste for composting

**4. Recovery:**
Energy generation from non-recyclable waste:
- Waste-to-energy facilities (planned)
- Biogas from organic waste

**5. Disposal:**
Only as a last resort:
- Sanitary landfills for non-recyclable, non-recoverable waste
- Strict regulations on hazardous waste

**EcoTrade's Role:**
Our platform facilitates steps 2-4, connecting waste generators with recyclers and ensuring materials stay in the circular economy as long as possible.

Every stakeholder has a role to play in moving up the waste hierarchy.""",
        "tags": "waste hierarchy,rwanda,recycling,sustainability,education",
        "is_published": True,
        "is_featured": False,
    },
    {
        "title": "Meet Our Recycler Partners: GreenCycle Rwanda",
        "slug": "greencycle-rwanda-profile",
        "category": "news",
        "excerpt": "Learn about one of Rwanda's leading recycling companies and their innovative approaches to waste management.",
        "content": """GreenCycle Rwanda has been at the forefront of Rwanda's recycling revolution since 2018. With a focus on UCO, plastics, and glass, they've diverted over 500 tons of waste from landfills.

**About GreenCycle:**
Founded by environmental engineer Jean-Pierre Habimana, GreenCycle operates from a modern facility in Kigali's industrial zone. They employ 45 people and operate a fleet of 8 collection vehicles.

**Services:**
- UCO collection and biodiesel production
- Plastic waste processing and pelletization
- Glass crushing and aggregate production
- Environmental consultation for businesses

**Innovation:**
GreenCycle recently launched Rwanda's first mobile recycling app, allowing individuals to schedule pickups and track their environmental impact.

**Community Impact:**
- Partnered with 50+ hotels and restaurants
- Trained 20 youth in recycling techniques
- Sponsored environmental education in schools
- Operates a small business incubator for green startups

**Future Plans:**
"We're expanding our capacity to handle electronic waste and plan to open a second facility in Huye by 2027," says Habimana. "EcoTrade has been instrumental in connecting us with quality suppliers and streamlining our operations."

Looking for a reliable recycling partner? Contact GreenCycle through our platform.""",
        "tags": "recyclers,greencycle,profile,innovation,rwanda",
        "is_published": True,
        "is_featured": False,
    },
    {
        "title": "How to Get Started with EcoTrade Rwanda",
        "slug": "getting-started-ecotrade-guide",
        "category": "news",
        "excerpt": "A step-by-step guide for hotels and recyclers joining Rwanda's leading waste trading platform.",
        "content": """Getting started with EcoTrade Rwanda is simple. Here's how to begin your journey toward sustainability and revenue generation.

**For Hotels and Restaurants:**

Step 1: Create Your Account
- Visit ecotrade.rw and click "Sign Up"
- Choose "Hotel/Restaurant" as your account type
- Provide business details and verification documents

Step 2: Complete Your Profile
- Add your location and business hours
- Specify waste types and typical volumes
- Upload required licenses and certifications

Step 3: Create Your First Listing
- Select waste type (UCO, glass, plastic, etc.)
- Specify quantity and collection frequency
- Set minimum acceptable bid
- Add photos and special instructions

Step 4: Receive and Review Bids
- Certified recyclers will bid on your listing
- Review company profiles and ratings
- Compare offers and terms
- Accept the best bid for your needs

Step 5: Schedule Collection
- Coordinate with the recycler's driver
- Prepare waste according to guidelines
- Collection is completed and verified
- Payment processed within 48 hours

**For Recyclers:**

Step 1: Registration
- Apply for a recycler account
- Submit business registration documents
- Provide processing capacity details
- Pass verification process (24-48 hours)

Step 2: Browse Listings
- Filter by waste type and location
- View detailed listing information
- Check collection schedules

Step 3: Place Your Bids
- Offer competitive prices
- Specify collection terms
- Add notes about your service

Step 4: Win and Collect
- Coordinate with hotels
- Dispatch drivers with proper equipment
- Complete collection with photo verification
- Build your reputation with ratings

**Support:**
Our team is available Monday-Saturday, 8 AM-6 PM
Email: support@ecotrade.rw
Phone: +250 788 000 000

Join hundreds of businesses already trading waste sustainably!""",
        "tags": "getting started,tutorial,guide,hotels,recyclers",
        "is_published": True,
        "is_featured": False,
    },
]

blog_count = 0
for post_data in blog_posts_data:
    post = BlogPost(
        author_id=admin_user.id,
        published_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30)),
        view_count=random.randint(50, 500),
        **post_data
    )
    db.add(post)
    blog_count += 1

db.commit()
print(f"  ✓ {blog_count} blog posts")

db.close()

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n✅  Comprehensive seed complete!")
print(f"\n📊 Database Statistics:")
print(f"   • {len(hotel_users)} hotel accounts")
print(f"   • {len(recycler_users)} recycler accounts")
print(f"   • {len(driver_users)} driver accounts")
print(f"   • {len(individual_users)} individual accounts")
print(f"   • {len(listings)} waste listings")
print(f"   • {len(bids)} bids")
print(f"   • {inventory_count} inventory items")
print(f"\n🔐 All accounts use password: Password123!")
print("\n📝 Sample Login Credentials:")
print("   ┌─────────────────────────────┬─────────────┐")
print("   │ Email                       │ Role        │")
print("   ├─────────────────────────────┼─────────────┤")
print("   │ admin@ecotrade.rw           │ Admin       │")
print("   │ hotel@kigali.rw             │ Hotel       │")
print("   │ recycler@greencycle.rw      │ Recycler    │")
print("   │ driver1@greencycle.rw       │ Driver      │")
print("   │ individual1@example.com     │ Individual  │")
print("   └─────────────────────────────┴─────────────┘")
print("\n🚀 Start the server:")
print("   cd backend")
print("   uvicorn app.main:app --reload --port 8000")
print("\n📚 API Documentation:")
print("   http://localhost:8000/api/docs")

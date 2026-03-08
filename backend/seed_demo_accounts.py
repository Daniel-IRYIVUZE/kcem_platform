"""
seed_demo_accounts.py — Seeds complete profiles and data for all demo accounts.
Ensures each user (hotel, recycler, driver) has unique, realistic data in the DB.
Run: python seed_demo_accounts.py
"""
import sqlite3
import json
import random
import os
from datetime import datetime, timedelta, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), 'ecotrade.db')
PWD_HASH = '$2b$12$0bMVLMCK6aOT7.BQsCEV0.qLFQnv5O/LJxUNa6pyxTORSVmx/2T9a'  # Password123!

def utcnow():
    return datetime.now(timezone.utc).isoformat()

def future(days=7):
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()

def past(days=3):
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

WASTE_IMAGES = {
    'uco':            'https://images.unsplash.com/photo-1528803689045-db3310f02a0e?w=600&auto=format&fit=crop',
    'glass':          'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop',
    'paper_cardboard':'https://images.unsplash.com/photo-1565793979079-60b777cf9f41?w=600&auto=format&fit=crop',
    'plastic':        'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop',
    'metal':          'https://images.unsplash.com/photo-1605627079912-97c3810a11a4?w=600&auto=format&fit=crop',
    'organic':        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop',
    'mixed':          'https://images.unsplash.com/photo-1532996122724-e3c679b576d8?w=600&auto=format&fit=crop',
}

def seed():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # ── helper ─────────────────────────────────────────────────────────────────
    def get_user_id(email):
        cur.execute('SELECT id FROM users WHERE email=?', (email,))
        r = cur.fetchone()
        if not r:
            raise ValueError(f'User {email} not found in DB')
        return r['id']

    def ensure_user(email, full_name, role, phone):
        cur.execute('SELECT id FROM users WHERE email=?', (email,))
        r = cur.fetchone()
        if r:
            return r['id']
        cur.execute('''INSERT INTO users
            (email, phone, full_name, password_hash, role, status, is_verified, is_email_verified, created_at, updated_at)
            VALUES (?,?,?,?,'{}','active',1,1,?,?)'''.format(role),
            (email, phone, full_name, PWD_HASH, utcnow(), utcnow()))
        return cur.lastrowid

    def get_hotel_id(user_id):
        cur.execute('SELECT id FROM hotels WHERE user_id=?', (user_id,))
        r = cur.fetchone()
        return r['id'] if r else None

    def get_recycler_id(user_id):
        cur.execute('SELECT id FROM recyclers WHERE user_id=?', (user_id,))
        r = cur.fetchone()
        return r['id'] if r else None

    # ─────────────────────────────────────────────────────────────────────────
    # HOTELS  (3 demo accounts)
    # ─────────────────────────────────────────────────────────────────────────
    DEMO_HOTELS = [
        {
            'email': 'hotel1@ecotrade.rw',
            'name': 'Kigali Radiant Hotel',
            'address': 'KG 501 St, Gasabo District, Kigali',
            'city': 'Kigali',
            'lat': -1.9321, 'lng': 30.0945,
            'stars': 4, 'rooms': 120,
            'phone': '+250 788 100 101',
            'description': 'Modern 4-star business hotel in Gasabo with conference facilities and rooftop dining.',
            'green_score': 72, 'total_waste_listed': 1850, 'total_revenue': 1450000,
            'waste_types': [
                {'type': 'glass', 'vol': 280, 'min_bid': 420, 'title': 'Mixed Glass Waste — Bottles & Containers'},
                {'type': 'plastic', 'vol': 195, 'min_bid': 310, 'title': 'Plastic Packaging & Beverage Bottles'},
            ]
        },
        {
            'email': 'hotel2@ecotrade.rw',
            'name': 'Hotel Inyange Kigali',
            'address': 'KN 78 Ave, Nyarugenge, Kigali',
            'city': 'Kigali',
            'lat': -1.9508, 'lng': 30.0612,
            'stars': 3, 'rooms': 85,
            'phone': '+250 788 200 202',
            'description': 'Comfortable boutique hotel in central Kigali with authentic Rwandan cuisine and events.',
            'green_score': 65, 'total_waste_listed': 1200, 'total_revenue': 960000,
            'waste_types': [
                {'type': 'uco', 'vol': 420, 'min_bid': 650, 'title': 'Used Cooking Oil — Restaurant Grade UCO'},
                {'type': 'organic', 'vol': 340, 'min_bid': 280, 'title': 'Organic Food Waste — Kitchen Compost'},
            ]
        },
        {
            'email': 'hotel3@ecotrade.rw',
            'name': 'Gorilla Hills Resort',
            'address': 'KG 11 Ave, Kacyiru, Kigali',
            'city': 'Kigali',
            'lat': -1.9417, 'lng': 30.0799,
            'stars': 5, 'rooms': 200,
            'phone': '+250 788 300 303',
            'description': 'Luxury eco-conscious 5-star resort with panoramic Kigali views and sustainability programs.',
            'green_score': 88, 'total_waste_listed': 3200, 'total_revenue': 2800000,
            'waste_types': [
                {'type': 'paper_cardboard', 'vol': 510, 'min_bid': 380, 'title': 'Paper & Cardboard — Office & Packaging Waste'},
                {'type': 'metal', 'vol': 175, 'min_bid': 520, 'title': 'Scrap Metal — Kitchen Equipment & Fittings'},
            ]
        },
    ]

    hotel_ids = {}
    for h in DEMO_HOTELS:
        uid = ensure_user(h['email'], h['name'], 'business', h['phone'])
        cur.execute('SELECT id FROM hotels WHERE user_id=?', (uid,))
        existing = cur.fetchone()
        if existing:
            hotel_ids[h['email']] = existing['id']
            print(f'  Hotel exists for {h["email"]}: id={existing["id"]}')
            continue
        cur.execute('''INSERT INTO hotels
            (user_id,hotel_name,description,address,city,district,latitude,longitude,
             phone,stars,room_count,is_verified,green_score,total_waste_listed,total_revenue,
             rating,review_count,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,4.2,23,?,?)''',
            (uid, h['name'], h['description'], h['address'], h['city'], 'Kigali',
             h['lat'], h['lng'], h['phone'], h['stars'], h['rooms'], 1,
             h['green_score'], h['total_waste_listed'], h['total_revenue'],
             utcnow(), utcnow()))
        hotel_ids[h['email']] = cur.lastrowid
        print(f'  Created hotel for {h["email"]}: id={hotel_ids[h["email"]]} — {h["name"]}')

    conn.commit()

    # ─────────────────────────────────────────────────────────────────────────
    # WASTE LISTINGS for demo hotels (2 per hotel)
    # ─────────────────────────────────────────────────────────────────────────
    listing_ids = {}  # email -> [id1, id2]
    for h in DEMO_HOTELS:
        hid = hotel_ids[h['email']]
        listing_ids[h['email']] = []
        for wt in h['waste_types']:
            cur.execute('SELECT id FROM waste_listings WHERE hotel_id=? AND waste_type=? AND status="open"', (hid, wt['type']))
            existing = cur.fetchone()
            if existing:
                listing_ids[h['email']].append(existing['id'])
                print(f'  Listing exists: hotel_id={hid} type={wt["type"]} id={existing["id"]}')
                continue
            img = WASTE_IMAGES.get(wt['type'], WASTE_IMAGES['mixed'])
            cur.execute('''INSERT INTO waste_listings
                (hotel_id,title,description,waste_type,volume,unit,min_bid,
                 address,latitude,longitude,status,bid_count,highest_bid,image_url,
                 is_urgent,notes,view_count,expires_at,created_at,updated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,0,0,?,0,?,?,?,?,?)''',
                (hid, wt['title'],
                 f"Regular collection of {wt['type'].replace('_',' ')} waste from {h['name']}. "
                 f"Collection available Mon-Fri 6AM-10AM. Contact reception to schedule.",
                 wt['type'], wt['vol'], 'liters' if wt['type'] == 'uco' else 'kg',
                 wt['min_bid'], h['address'], h['lat'] + 0.001, h['lng'] + 0.001,
                 'open', img,
                 f"Please bring appropriate containers. Weight may vary by ±5%.",
                 42 + random.randint(0, 80),
                 future(random.randint(5, 14)), utcnow(), utcnow()))
            lid = cur.lastrowid
            listing_ids[h['email']].append(lid)
            print(f'  Created listing: id={lid} type={wt["type"]} vol={wt["vol"]} — {wt["title"][:40]}')

    conn.commit()

    # ─────────────────────────────────────────────────────────────────────────
    # RECYCLERS (3 demo accounts)
    # ─────────────────────────────────────────────────────────────────────────
    DEMO_RECYCLERS = [
        {
            'email': 'recycler1@ecotrade.rw',
            'company': 'EcoRevive Rwanda',
            'address': 'KK 204 St, Kicukiro, Kigali',
            'city': 'Kigali',
            'lat': -1.9673, 'lng': 30.0987,
            'phone': '+250 788 400 401',
            'description': 'Specializing in UCO, plastic, and glass recycling with biodiesel conversion technology.',
            'waste_types': 'uco,glass,plastic',
            'capacity': 15000, 'fleet_size': 4,
            'green_score': 78, 'total_collected': 12800, 'total_spent': 9600000,
        },
        {
            'email': 'recycler2@ecotrade.rw',
            'company': 'GreenPath Solutions',
            'address': 'KN 15 Ave, Nyarugenge, Kigali',
            'city': 'Kigali',
            'lat': -1.9495, 'lng': 30.0570,
            'phone': '+250 788 500 502',
            'description': 'Organic waste and compost specialists. We convert food and organic waste into premium compost.',
            'waste_types': 'organic,paper_cardboard,mixed',
            'capacity': 20000, 'fleet_size': 3,
            'green_score': 82, 'total_collected': 18400, 'total_spent': 11200000,
        },
        {
            'email': 'recycler3@ecotrade.rw',
            'company': 'MetalPlus Recycling',
            'address': 'KG 512 Blvd, Gasabo, Kigali',
            'city': 'Kigali',
            'lat': -1.9289, 'lng': 30.1021,
            'phone': '+250 788 600 603',
            'description': 'Metal and e-waste recycling. Licensed for all metals, offering competitive market prices.',
            'waste_types': 'metal,electronic,mixed',
            'capacity': 25000, 'fleet_size': 5,
            'green_score': 74, 'total_collected': 9500, 'total_spent': 14700000,
        },
    ]

    recycler_ids = {}
    for rc in DEMO_RECYCLERS:
        uid = ensure_user(rc['email'], rc['company'], 'recycler', rc['phone'])
        cur.execute('SELECT id FROM recyclers WHERE user_id=?', (uid,))
        existing = cur.fetchone()
        if existing:
            recycler_ids[rc['email']] = existing['id']
            print(f'  Recycler exists for {rc["email"]}: id={existing["id"]}')
            continue
        cur.execute('''INSERT INTO recyclers
            (user_id,company_name,description,address,city,district,latitude,longitude,
             phone,is_verified,waste_types_handled,storage_capacity,green_score,
             total_collected,total_spent,rating,review_count,fleet_size,active_bids,
             created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,1,?,?,?,?,?,4.1,18,?,0,?,?)''',
            (uid, rc['company'], rc['description'], rc['address'], rc['city'], 'Kigali',
             rc['lat'], rc['lng'], rc['phone'], rc['waste_types'],
             rc['capacity'], rc['green_score'], rc['total_collected'], rc['total_spent'],
             rc['fleet_size'], utcnow(), utcnow()))
        recycler_ids[rc['email']] = cur.lastrowid
        print(f'  Created recycler for {rc["email"]}: id={recycler_ids[rc["email"]]} — {rc["company"]}')

    conn.commit()

    # ─────────────────────────────────────────────────────────────────────────
    # VEHICLES for demo recyclers
    # ─────────────────────────────────────────────────────────────────────────
    VEHICLES = [
        {'recycler_email': 'recycler1@ecotrade.rw', 'plate': 'RAB 001 A', 'type': 'Collection Truck', 'make': 'Isuzu', 'model': 'NPR', 'year': 2021, 'cap': 3000},
        {'recycler_email': 'recycler1@ecotrade.rw', 'plate': 'RAB 002 A', 'type': 'Pickup Van', 'make': 'Toyota', 'model': 'Hilux', 'year': 2022, 'cap': 1000},
        {'recycler_email': 'recycler2@ecotrade.rw', 'plate': 'RAC 101 B', 'type': 'Collection Truck', 'make': 'Mitsubishi', 'model': 'Canter', 'year': 2020, 'cap': 4500},
        {'recycler_email': 'recycler2@ecotrade.rw', 'plate': 'RAC 102 B', 'type': 'Pickup Van', 'make': 'Toyota', 'model': 'Land Cruiser', 'year': 2023, 'cap': 800},
        {'recycler_email': 'recycler3@ecotrade.rw', 'plate': 'RAD 201 C', 'type': 'Heavy Truck', 'make': 'UD Trucks', 'model': 'Quester', 'year': 2021, 'cap': 8000},
        {'recycler_email': 'recycler3@ecotrade.rw', 'plate': 'RAD 202 C', 'type': 'Collection Truck', 'make': 'Isuzu', 'model': 'FRR', 'year': 2022, 'cap': 5000},
    ]
    vehicle_ids = {}
    for v in VEHICLES:
        rid = recycler_ids.get(v['recycler_email'])
        if not rid:
            continue
        cur.execute('SELECT id FROM vehicles WHERE plate_number=?', (v['plate'],))
        existing = cur.fetchone()
        if existing:
            vehicle_ids[v['plate']] = existing['id']
            continue
        cur.execute('''INSERT INTO vehicles
            (recycler_id,plate_number,vehicle_type,make,model,year,capacity_kg,status,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?)''',
            (rid, v['plate'], v['type'], v['make'], v['model'], v['year'], v['cap'],
             'active', utcnow(), utcnow()))
        vehicle_ids[v['plate']] = cur.lastrowid
        print(f'  Created vehicle: {v["plate"]} ({v["make"]} {v["model"]})')

    conn.commit()

    # ─────────────────────────────────────────────────────────────────────────
    # DRIVERS (2 demo accounts)
    # ─────────────────────────────────────────────────────────────────────────
    DEMO_DRIVERS = [
        {
            'email': 'driver1@ecotrade.rw',
            'name': 'Jean-Claude Mugisha',
            'phone': '+250 788 111 001',
            'recycler_email': 'recycler1@ecotrade.rw',
            'vehicle_plate': 'RAB 001 A',
            'license': 'DL-RW-2021-1001',
        },
        {
            'email': 'driver2@ecotrade.rw',
            'name': 'Eric Habimana',
            'phone': '+250 788 111 002',
            'recycler_email': 'recycler2@ecotrade.rw',
            'vehicle_plate': 'RAC 101 B',
            'license': 'DL-RW-2022-1002',
        },
    ]
    driver_ids = {}
    for dr in DEMO_DRIVERS:
        uid = ensure_user(dr['email'], dr['name'], 'driver', dr['phone'])
        cur.execute('SELECT id FROM drivers WHERE user_id=?', (uid,))
        existing = cur.fetchone()
        if existing:
            driver_ids[dr['email']] = existing['id']
            print(f'  Driver exists for {dr["email"]}: id={existing["id"]}')
            continue
        rid = recycler_ids.get(dr['recycler_email'])
        vid = vehicle_ids.get(dr['vehicle_plate'])
        cur.execute('''INSERT INTO drivers
            (user_id,recycler_id,vehicle_id,license_number,phone,status,
             current_lat,current_lng,rating,review_count,total_trips,total_distance,
             is_verified,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,4.6,12,87,2340,1,?,?)''',
            (uid, rid, vid, dr['license'], dr['phone'], 'available',
             -1.9536 + random.uniform(-0.01, 0.01),
             30.0928 + random.uniform(-0.01, 0.01),
             utcnow(), utcnow()))
        driver_ids[dr['email']] = cur.lastrowid
        print(f'  Created driver for {dr["email"]}: id={driver_ids[dr["email"]]} — {dr["name"]}')

    conn.commit()

    # ─────────────────────────────────────────────────────────────────────────
    # BIDS — demo recyclers bid on demo hotel listings
    # ─────────────────────────────────────────────────────────────────────────
    bid_data = [
        # recycler1 (EcoRevive) bids on glass & plastic (hotel1 → glass, plastic)
        {'recycler_email': 'recycler1@ecotrade.rw', 'hotel_email': 'hotel1@ecotrade.rw', 'idx': 0, 'amount_mult': 1.15},
        {'recycler_email': 'recycler1@ecotrade.rw', 'hotel_email': 'hotel1@ecotrade.rw', 'idx': 1, 'amount_mult': 1.1},
        # recycler1 also bids on UCO (hotel2)
        {'recycler_email': 'recycler1@ecotrade.rw', 'hotel_email': 'hotel2@ecotrade.rw', 'idx': 0, 'amount_mult': 1.2},
        # recycler2 (GreenPath) bids on organic & UCO (hotel2)
        {'recycler_email': 'recycler2@ecotrade.rw', 'hotel_email': 'hotel2@ecotrade.rw', 'idx': 0, 'amount_mult': 1.1},
        {'recycler_email': 'recycler2@ecotrade.rw', 'hotel_email': 'hotel2@ecotrade.rw', 'idx': 1, 'amount_mult': 1.05},
        # recycler2 also bids on paper (hotel3)
        {'recycler_email': 'recycler2@ecotrade.rw', 'hotel_email': 'hotel3@ecotrade.rw', 'idx': 0, 'amount_mult': 1.15},
        # recycler3 (MetalPlus) bids on metal & paper (hotel3)
        {'recycler_email': 'recycler3@ecotrade.rw', 'hotel_email': 'hotel3@ecotrade.rw', 'idx': 1, 'amount_mult': 1.18},
        {'recycler_email': 'recycler3@ecotrade.rw', 'hotel_email': 'hotel3@ecotrade.rw', 'idx': 0, 'amount_mult': 1.08},
        # recycler3 also bids on plastic (hotel1)
        {'recycler_email': 'recycler3@ecotrade.rw', 'hotel_email': 'hotel1@ecotrade.rw', 'idx': 1, 'amount_mult': 1.12},
    ]

    placed_bids = []
    for bd in bid_data:
        rid = recycler_ids.get(bd['recycler_email'])
        listings_for_hotel = listing_ids.get(bd['hotel_email'], [])
        if bd['idx'] >= len(listings_for_hotel):
            continue
        lid = listings_for_hotel[bd['idx']]
        if not lid or not rid:
            continue
        cur.execute('SELECT id FROM bids WHERE listing_id=? AND recycler_id=?', (lid, rid))
        if cur.fetchone():
            continue
        # find min_bid for this listing
        cur.execute('SELECT min_bid FROM waste_listings WHERE id=?', (lid,))
        listing_row = cur.fetchone()
        if not listing_row:
            continue
        amount = int(listing_row['min_bid'] * bd['amount_mult'])
        cur.execute('''INSERT INTO bids
            (listing_id,recycler_id,amount,status,notes,is_auto_bid,created_at,updated_at)
            VALUES (?,?,?,?,?,0,?,?)''',
            (lid, rid, amount, 'active',
             'Competitive bid with fast collection within 24h of acceptance.',
             utcnow(), utcnow()))
        bid_id = cur.lastrowid
        placed_bids.append({'bid_id': bid_id, 'listing_id': lid, 'recycler_id': rid, 'amount': amount})
        # update listing bid stats
        cur.execute('UPDATE waste_listings SET bid_count=bid_count+1, highest_bid=MAX(highest_bid,?) WHERE id=?', (amount, lid))
        print(f'  Created bid: id={bid_id} listing={lid} recycler={rid} amount=RWF{amount:,}')

    conn.commit()

    # ─────────────────────────────────────────────────────────────────────────
    # COLLECTIONS — scheduled collections for driver dashboard
    # ─────────────────────────────────────────────────────────────────────────
    # Accept one bid per hotel listing so we can create a collection
    collections_created = []
    col_schedule = [
        # hotel1 glass listing → recycler1's bid → driver1
        {'hotel_email': 'hotel1@ecotrade.rw', 'listing_idx': 0, 'recycler_email': 'recycler1@ecotrade.rw',
         'driver_email': 'driver1@ecotrade.rw', 'vehicle_plate': 'RAB 001 A',
         'status': 'scheduled', 'date_offset': 2},
        # hotel2 UCO listing → recycler1's bid → driver1
        {'hotel_email': 'hotel2@ecotrade.rw', 'listing_idx': 0, 'recycler_email': 'recycler1@ecotrade.rw',
         'driver_email': 'driver1@ecotrade.rw', 'vehicle_plate': 'RAB 001 A',
         'status': 'en-route', 'date_offset': 0},
        # hotel2 organic listing → recycler2's bid → driver2
        {'hotel_email': 'hotel2@ecotrade.rw', 'listing_idx': 1, 'recycler_email': 'recycler2@ecotrade.rw',
         'driver_email': 'driver2@ecotrade.rw', 'vehicle_plate': 'RAC 101 B',
         'status': 'scheduled', 'date_offset': 1},
        # hotel3 paper listing → recycler2's bid → driver2
        {'hotel_email': 'hotel3@ecotrade.rw', 'listing_idx': 0, 'recycler_email': 'recycler2@ecotrade.rw',
         'driver_email': 'driver2@ecotrade.rw', 'vehicle_plate': 'RAC 101 B',
         'status': 'scheduled', 'date_offset': 3},
        # Completed collections for historical revenue data
        {'hotel_email': 'hotel1@ecotrade.rw', 'listing_idx': 1, 'recycler_email': 'recycler3@ecotrade.rw',
         'driver_email': 'driver1@ecotrade.rw', 'vehicle_plate': 'RAB 001 A',
         'status': 'completed', 'date_offset': -5},
        {'hotel_email': 'hotel3@ecotrade.rw', 'listing_idx': 1, 'recycler_email': 'recycler3@ecotrade.rw',
         'driver_email': 'driver2@ecotrade.rw', 'vehicle_plate': 'RAC 101 B',
         'status': 'completed', 'date_offset': -8},
    ]

    for cs in col_schedule:
        hid = hotel_ids.get(cs['hotel_email'])
        lids = listing_ids.get(cs['hotel_email'], [])
        if cs['listing_idx'] >= len(lids):
            continue
        lid = lids[cs['listing_idx']]
        rid = recycler_ids.get(cs['recycler_email'])
        did = driver_ids.get(cs['driver_email'])
        vid = vehicle_ids.get(cs['vehicle_plate'])
        if not (hid and lid and rid and did and vid):
            print(f'  Skipping collection (missing data): hotel={hid} lid={lid} rid={rid} did={did} vid={vid}')
            continue
        
        cur.execute('SELECT id FROM collections WHERE listing_id=? AND recycler_id=?', (lid, rid))
        if cur.fetchone():
            continue

        sched_dt = datetime.now(timezone.utc) + timedelta(days=cs['date_offset'])
        status_map = {'scheduled': 'scheduled', 'en-route': 'en-route', 'completed': 'completed'}
        db_status = status_map.get(cs['status'], 'scheduled')

        completed_at = None
        if cs['status'] == 'completed':
            completed_at = (sched_dt + timedelta(hours=2)).isoformat()

        cur.execute('''INSERT INTO collections
            (listing_id,hotel_id,recycler_id,driver_id,vehicle_id,
             status,scheduled_date,scheduled_time,completed_at,
             actual_volume,notes,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (lid, hid, rid, did, vid, db_status,
             sched_dt.isoformat(), '08:00', completed_at,
             None if cs['status'] != 'completed' else None,
             'Scheduled collection from hotel. All safety gear required.',
             utcnow(), utcnow()))
        col_id = cur.lastrowid
        collections_created.append({'col_id': col_id, 'listing_id': lid, 'driver_id': did, 'status': db_status})
        print(f'  Created collection: id={col_id} listing={lid} driver={did} status={db_status}')

    conn.commit()

    # ─────────────────────────────────────────────────────────────────────────
    # ROUTES for drivers
    # ─────────────────────────────────────────────────────────────────────────
    driver_collections = {}
    for c in collections_created:
        did = c['driver_id']
        if did not in driver_collections:
            driver_collections[did] = []
        driver_collections[did].append(c)

    driver1_id = driver_ids.get('driver1@ecotrade.rw')
    driver2_id = driver_ids.get('driver2@ecotrade.rw')

    for drv_email, drv_id in [('driver1@ecotrade.rw', driver1_id), ('driver2@ecotrade.rw', driver2_id)]:
        if not drv_id:
            continue
        # Today's active route
        cur.execute('SELECT id FROM routes WHERE driver_id=? AND status=?', (drv_id, 'active'))
        if not cur.fetchone():
            cur.execute('''INSERT INTO routes
                (driver_id,date,status,total_stops,completed_stops,total_distance,
                 estimated_time,notes,created_at,updated_at)
                VALUES (?,?,?,2,0,12.5,90,?,?,?)''',
                (drv_id, datetime.now(timezone.utc).isoformat(),
                 'active', 'Regular morning collection route',
                 utcnow(), utcnow()))
            route_id = cur.lastrowid
            print(f'  Created route: id={route_id} driver={drv_id}')

            # Route stops from collections for this driver
            stop_order = 1
            for c in driver_collections.get(drv_id, []):
                if c['status'] in ('scheduled', 'en-route'):
                    # Get listing hotel info
                    cur.execute('''SELECT h.hotel_name, h.address, h.latitude, h.longitude
                    FROM waste_listings wl JOIN hotels h ON h.id = wl.hotel_id WHERE wl.id=?''', (c['listing_id'],))
                    hotel_row = cur.fetchone()
                    if hotel_row:
                        cur.execute('''INSERT INTO route_stops
                            (route_id,collection_id,stop_order,hotel_name,address,
                             latitude,longitude,status,created_at)
                            VALUES (?,?,?,?,?,?,?,?,?)''',
                            (route_id, c['col_id'], stop_order,
                             hotel_row['hotel_name'], hotel_row['address'],
                             hotel_row['latitude'], hotel_row['longitude'],
                             'pending', utcnow()))
                        stop_order += 1

        # Yesterday's completed route
        cur.execute('SELECT id FROM routes WHERE driver_id=? AND status=?', (drv_id, 'completed'))
        if not cur.fetchone():
            yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
            cur.execute('''INSERT INTO routes
                (driver_id,date,status,total_stops,completed_stops,total_distance,
                 estimated_time,actual_start,actual_end,notes,created_at,updated_at)
                VALUES (?,?,?,3,3,18.2,115,?,?,?,?,?)''',
                (drv_id, yesterday, 'completed',
                 (datetime.now(timezone.utc) - timedelta(days=1, hours=3)).isoformat(),
                 (datetime.now(timezone.utc) - timedelta(days=1, hours=1)).isoformat(),
                 'Completed all collections. Good traffic conditions.',
                 utcnow(), utcnow()))
            print(f'  Created completed route for driver {drv_id}')

    conn.commit()

    # ─────────────────────────────────────────────────────────────────────────
    # INVENTORY for demo recyclers
    # ─────────────────────────────────────────────────────────────────────────
    inventory_items = [
        {'recycler_email': 'recycler1@ecotrade.rw', 'material': 'UCO', 'stock': 4800, 'cap': 15000, 'unit': 'liters'},
        {'recycler_email': 'recycler1@ecotrade.rw', 'material': 'Glass', 'stock': 2200, 'cap': 8000, 'unit': 'kg'},
        {'recycler_email': 'recycler1@ecotrade.rw', 'material': 'Plastic', 'stock': 1500, 'cap': 6000, 'unit': 'kg'},
        {'recycler_email': 'recycler2@ecotrade.rw', 'material': 'Organic', 'stock': 8500, 'cap': 20000, 'unit': 'kg'},
        {'recycler_email': 'recycler2@ecotrade.rw', 'material': 'Paper/Cardboard', 'stock': 3200, 'cap': 10000, 'unit': 'kg'},
        {'recycler_email': 'recycler3@ecotrade.rw', 'material': 'Metal', 'stock': 6700, 'cap': 25000, 'unit': 'kg'},
        {'recycler_email': 'recycler3@ecotrade.rw', 'material': 'Electronic', 'stock': 850, 'cap': 5000, 'unit': 'kg'},
    ]
    for inv in inventory_items:
        rid = recycler_ids.get(inv['recycler_email'])
        if not rid:
            continue
        cur.execute('SELECT id FROM inventory_items WHERE recycler_id=? AND material_type=?', (rid, inv['material']))
        if cur.fetchone():
            continue
        cur.execute('''INSERT INTO inventory_items
            (recycler_id,material_type,current_stock,capacity,unit,last_updated,created_at)
            VALUES (?,?,?,?,?,?,?)''',
            (rid, inv['material'], inv['stock'], inv['cap'], inv['unit'], utcnow(), utcnow()))
        print(f'  Created inventory: {inv["material"]} {inv["stock"]}/{inv["cap"]} {inv["unit"]}')

    conn.commit()

    # ─────────────────────────────────────────────────────────────────────────
    # NOTIFICATIONS for all demo users
    # ─────────────────────────────────────────────────────────────────────────
    notif_data = [
        ('hotel1@ecotrade.rw', 'bid_placed', 'New Bid Received', 'EcoRevive Rwanda placed a bid on your Glass Waste listing', '/marketplace'),
        ('hotel1@ecotrade.rw', 'bid_placed', 'Bid Updated', 'MetalPlus Recycling increased their bid on Plastic Packaging', '/marketplace'),
        ('hotel2@ecotrade.rw', 'bid_placed', 'New Bid Received', 'GreenPath Solutions placed a bid of RWF 715 on your UCO listing', '/marketplace'),
        ('hotel3@ecotrade.rw', 'bid_placed', 'New Bid Received', 'RecyclerMetalPlus bid on your Metal Scrap listing', '/marketplace'),
        ('hotel3@ecotrade.rw', 'collection_scheduled', 'Collection Scheduled', 'GreenPath Solutions scheduled a collection for your Paper Waste', '/dashboard/business/schedule'),
        ('recycler1@ecotrade.rw', 'listing_available', 'New Listing Available', 'Kigali Radiant Hotel posted a new Glass Waste listing', '/marketplace'),
        ('recycler1@ecotrade.rw', 'collection_assigned', 'Collection Assigned', 'A driver has been assigned to your UCO collection', '/dashboard/recycler/collections'),
        ('recycler2@ecotrade.rw', 'listing_available', 'New Listing Available', 'Hotel Inyange posted new Organic Waste — 340kg available', '/marketplace'),
        ('recycler3@ecotrade.rw', 'bid_accepted', 'Bid Accepted!', 'Your bid was accepted for Plastic Packaging at Kigali Radiant Hotel', '/dashboard/recycler/bids'),
        ('driver1@ecotrade.rw', 'route_assigned', 'New Route Assigned', 'You have 2 pickups scheduled for today', '/dashboard/driver'),
        ('driver2@ecotrade.rw', 'route_assigned', 'New Route Assigned', 'Collection scheduled tomorrow 8AM — Hotel Inyange', '/dashboard/driver'),
    ]
    for (email, ntype, title, body, link) in notif_data:
        try:
            uid = get_user_id(email)
        except ValueError:
            continue
        cur.execute('SELECT id FROM notifications WHERE user_id=? AND title=?', (uid, title))
        if cur.fetchone():
            continue
        cur.execute('''INSERT INTO notifications (user_id,type,title,body,link,is_read,created_at)
            VALUES (?,?,?,?,?,0,?)''', (uid, ntype, title, body, link, utcnow()))

    conn.commit()
    print('\nAll demo data seeded successfully!')

    # Final summary
    cur.execute('SELECT COUNT(*) FROM users')
    print(f'Total users: {cur.fetchone()[0]}')
    cur.execute('SELECT COUNT(*) FROM hotels')
    print(f'Total hotels: {cur.fetchone()[0]}')
    cur.execute('SELECT COUNT(*) FROM recyclers')
    print(f'Total recyclers: {cur.fetchone()[0]}')
    cur.execute('SELECT COUNT(*) FROM drivers')
    print(f'Total drivers: {cur.fetchone()[0]}')
    cur.execute('SELECT COUNT(*) FROM waste_listings WHERE status="open"')
    print(f'Open listings: {cur.fetchone()[0]}')
    cur.execute('SELECT COUNT(*) FROM bids')
    print(f'Total bids: {cur.fetchone()[0]}')
    cur.execute('SELECT COUNT(*) FROM collections')
    print(f'Total collections: {cur.fetchone()[0]}')
    cur.execute('SELECT COUNT(*) FROM routes')
    print(f'Total routes: {cur.fetchone()[0]}')

    conn.close()

if __name__ == '__main__':
    seed()

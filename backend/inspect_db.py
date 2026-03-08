import sqlite3
import math

# Real Kigali hotel coordinates
HOTEL_COORDS = {
    1: (-1.9441, 30.0619),   # Kigali Serena Hotel - KN 3 Ave
    2: (-1.9537, 30.0605),   # Radisson Blu Kigali - KG 2 Roundabout
    3: (-1.9477, 30.0589),   # Kigali Marriott Hotel - Nyarugenge
    4: (-1.9385, 30.0857),   # Kigali Hilton Garden Inn - Kimihurura
    5: (-1.9375, 30.0758),   # Hotel Lemigo - Kacyiru
    6: (-1.9441, 30.1096),   # Heaven Restaurant - Kimihurura
    7: (-1.9605, 30.0946),   # Novotel Kigali - Umuganda
    8: (-1.9534, 30.0590),   # Hotel des Mille Collines - Kiyovu
    9: (-1.9537, 30.0566),   # Park Inn by Radisson - Kiyovu
    10: (-1.9386, 30.1187),  # Kigali Mountain View Retreat - Kimironko
}

conn = sqlite3.connect('ecotrade.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Update hotel coordinates
for hotel_id, (lat, lng) in HOTEL_COORDS.items():
    cur.execute("UPDATE hotels SET latitude=?, longitude=? WHERE id=?", (lat, lng, hotel_id))
print(f"Updated {cur.rowcount} hotel(s) coordinates")

# Update waste_listing coordinates from hotel coords, and round volume/min_bid to integers
cur.execute("SELECT id, hotel_id, volume, min_bid FROM waste_listings")
listings = cur.fetchall()
for lst in listings:
    hotel_id = lst['hotel_id']
    coords = HOTEL_COORDS.get(hotel_id, (-1.9536, 30.0928))
    lat, lng = coords
    # Add small offset per listing so markers don't overlap exactly
    offset = (lst['id'] % 20 - 10) * 0.001
    lat += offset * 0.3
    lng += (lst['id'] % 7 - 3) * 0.001
    # Round volume and min_bid to integers
    volume_int = max(1, round(lst['volume']))
    min_bid_int = max(1, round(lst['min_bid']))
    cur.execute(
        "UPDATE waste_listings SET latitude=?, longitude=?, volume=?, min_bid=? WHERE id=?",
        (lat, lng, volume_int, min_bid_int, lst['id'])
    )
print(f"Updated {len(listings)} listing(s) with coordinates + rounded numbers")

conn.commit()

# Verify
cur.execute("SELECT id, hotel_id, volume, min_bid, latitude, longitude FROM waste_listings LIMIT 5")
print("\nSample updated listings:")
for r in cur.fetchall():
    print(dict(r))

conn.close()
print("\nDatabase update complete!")

# ---- original inspection code below ---- 
conn2 = sqlite3.connect('ecotrade.db')
conn2.row_factory = sqlite3.Row
cur2 = conn2.cursor()

# Tables
cur2.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur2.fetchall()]
print('Tables:', tables)

# Users
cur.execute("SELECT id, full_name, role, latitude, longitude FROM users LIMIT 10")
rows = cur.fetchall()
print(f'\nUsers ({len(rows)}):')
for r in rows:
    print(f'  {r["id"]}: {r["full_name"]} ({r["role"]}), lat={r["latitude"]}, lon={r["longitude"]}')

# Listings
cur.execute("SELECT id, title, price, quantity, user_id, latitude, longitude, status FROM listings LIMIT 10")
rows = cur.fetchall()
print(f'\nListings ({len(rows)}):')
for r in rows:
    print(f'  {r["id"]}: {r["title"]} price={r["price"]} qty={r["quantity"]} user_id={r["user_id"]} lat={r["latitude"]} lon={r["longitude"]} status={r["status"]}')

# Count listings per user
cur.execute("SELECT user_id, COUNT(*) as cnt FROM listings GROUP BY user_id")
rows = cur.fetchall()
print(f'\nListings per user:')
for r in rows:
    print(f'  user_id={r["user_id"]}: {r["cnt"]} listings')

# Reviews
cur.execute("SELECT id, rating, user_id FROM reviews LIMIT 5")
rows = cur.fetchall()
print(f'\nReviews:')
for r in rows:
    print(f'  id={r["id"]} rating={r["rating"]} user_id={r["user_id"]}')

# Transactions
cur.execute("SELECT id, amount, buyer_id, seller_id FROM transactions LIMIT 5")
rows = cur.fetchall()
print(f'\nTransactions:')
for r in rows:
    print(f'  id={r["id"]} amount={r["amount"]} buyer={r["buyer_id"]} seller={r["seller_id"]}')

conn.close()

"""
fix_listings.py — Ensures each hotel has at most 2 different waste types listed.
Keeps the best listing per waste type (highest bid count, then most recent).
Also ensures status is 'open' for kept listings.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'ecotrade.db')

WASTE_IMAGES = {
    'uco':       'https://images.unsplash.com/photo-1528803689045-db3310f02a0e?w=600&auto=format&fit=crop',
    'glass':     'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop',
    'paper':     'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=600&auto=format&fit=crop',
    'cardboard': 'https://images.unsplash.com/photo-1565793979079-60b777cf9f41?w=600&auto=format&fit=crop',
    'plastic':   'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop',
    'metal':     'https://images.unsplash.com/photo-1605627079912-97c3810a11a4?w=600&auto=format&fit=crop',
    'organic':   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop',
    'mixed':     'https://images.unsplash.com/photo-1532996122724-e3c679b576d8?w=600&auto=format&fit=crop',
}

def fix_listings():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Get all hotels
    cur.execute("SELECT id, hotel_name FROM hotels ORDER BY id")
    hotels = cur.fetchall()
    print(f"Found {len(hotels)} hotels\n")

    keep_ids = []   # listing IDs to keep as 'open'
    close_ids = []  # listing IDs to close

    for hotel in hotels:
        hid = hotel['id']
        hname = hotel['hotel_name']

        # Get all listings for this hotel, ordered by bid count desc, then id desc
        cur.execute("""
            SELECT wl.id, wl.waste_type, wl.status,
                   (SELECT COUNT(*) FROM bids b WHERE b.listing_id = wl.id) AS bid_count
            FROM waste_listings wl
            WHERE wl.hotel_id = ?
            ORDER BY bid_count DESC, wl.id DESC
        """, (hid,))
        listings = cur.fetchall()

        if not listings:
            print(f"  {hname}: no listings")
            continue

        # Select 2 different waste types - prioritize ones with highest bids
        selected_types = {}
        for row in listings:
            wtype = (row['waste_type'] or '').lower().strip()
            if len(selected_types) < 2 and wtype not in selected_types:
                selected_types[wtype] = row['id']
            elif wtype in selected_types:
                # already have this type - close duplicate
                close_ids.append(row['id'])
            else:
                # 3rd+ type - close
                close_ids.append(row['id'])

        kept = list(selected_types.values())
        keep_ids.extend(kept)

        # Also close extra listings of the same type beyond the best one
        type_seen = set()
        for row in listings:
            wtype = (row['waste_type'] or '').lower().strip()
            if row['id'] in kept:
                type_seen.add(wtype)
            elif row['id'] not in close_ids:
                close_ids.append(row['id'])

        waste_types = ', '.join(f"{k} (id={v})" for k, v in selected_types.items())
        print(f"  {hname}: keeping {len(selected_types)} type(s): {waste_types}")

    print(f"\nKeeping {len(keep_ids)} listings as 'open'")
    print(f"Closing {len(close_ids)} listings\n")

    # Open the kept ones
    for lid in keep_ids:
        cur.execute("UPDATE waste_listings SET status='open' WHERE id=?", (lid,))

    # Close the rest
    for lid in close_ids:
        cur.execute("UPDATE waste_listings SET status='closed' WHERE id=?", (lid,))

    # Add image_url column if it doesn't exist (optional metadata)
    cur.execute("PRAGMA table_info(waste_listings)")
    cols = [c['name'] for c in cur.fetchall()]
    if 'image_url' not in cols:
        cur.execute("ALTER TABLE waste_listings ADD COLUMN image_url TEXT")
        print("Added image_url column to waste_listings")

    # Set image URLs based on waste type
    for lid in keep_ids:
        cur.execute("SELECT waste_type FROM waste_listings WHERE id=?", (lid,))
        row = cur.fetchone()
        if row:
            wtype = (row['waste_type'] or '').lower().strip()
            img = WASTE_IMAGES.get(wtype, WASTE_IMAGES['mixed'])
            cur.execute("UPDATE waste_listings SET image_url=? WHERE id=?", (img, lid))

    conn.commit()

    # Verify
    cur.execute("""
        SELECT h.hotel_name, wl.waste_type, wl.status, wl.id
        FROM waste_listings wl
        JOIN hotels h ON h.id = wl.hotel_id
        WHERE wl.status = 'open'
        ORDER BY h.id, wl.waste_type
    """)
    rows = cur.fetchall()
    print(f"Final open listings: {len(rows)}")
    print(f"{'Hotel':<30} {'Type':<15} {'ID':>5}")
    print("-" * 55)
    for r in rows:
        print(f"  {r['hotel_name']:<28} {r['waste_type']:<15} {r['id']:>5}")

    conn.close()
    print("\nDone!")

if __name__ == '__main__':
    fix_listings()

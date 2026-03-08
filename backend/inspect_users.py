import sqlite3
conn = sqlite3.connect('ecotrade.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute('''
SELECT u.id, u.full_name, u.email, r.name as role_name,
       h.id as hotel_id, h.hotel_name,
       rp.id as recycler_id, rp.company_name,
       d.id as driver_id
FROM users u
JOIN roles r ON r.id = u.role_id
LEFT JOIN hotels h ON h.user_id = u.id
LEFT JOIN recycler_profiles rp ON rp.user_id = u.id
LEFT JOIN driver_profiles d ON d.user_id = u.id
ORDER BY r.name, u.id
LIMIT 40
''')
rows = cur.fetchall()
print(f'Total users: {len(rows)}')
print(f'  {"Email":<32} {"Role":<12} {"PID":<5} {"ProfileName"}')
print('-'*80)
for r in rows:
    pid = r['hotel_id'] or r['recycler_id'] or r['driver_id'] or '-'
    pname = r['hotel_name'] or r['company_name'] or '-'
    print(f'  {r["email"]:<32} {r["role_name"]:<12} {str(pid):<5} {pname}')

print()
cur.execute('''SELECT h.id, h.hotel_name, h.user_id, COUNT(wl.id) as cnt
FROM hotels h LEFT JOIN waste_listings wl ON wl.hotel_id = h.id AND wl.status="open"
GROUP BY h.id ORDER BY h.id''')
hotels = cur.fetchall()
print('Open listings per hotel:')
for h in hotels:
    print(f'  hotel_id={h["id"]} user_id={h["user_id"]} listings={h["cnt"]}  {h["hotel_name"]}')

print()
cur.execute('''SELECT rp.id, rp.company_name, rp.user_id,
       COUNT(b.id) as bid_count
FROM recycler_profiles rp
LEFT JOIN bids b ON b.recycler_id = rp.id
GROUP BY rp.id ORDER BY rp.id''')
recyclers = cur.fetchall()
print('Bids per recycler:')
for r in recyclers:
    print(f'  recycler_id={r["id"]} user_id={r["user_id"]} bids={r["bid_count"]}  {r["company_name"]}')

print()
cur.execute('''SELECT dp.id, dp.user_id, u.full_name
FROM driver_profiles dp JOIN users u ON u.id = dp.user_id
ORDER BY dp.id LIMIT 15''')
drivers = cur.fetchall()
print('Drivers:')
for d in drivers:
    print(f'  driver_id={d["id"]} user_id={d["user_id"]}  {d["full_name"]}')

# Check bids table structure
print()
cur.execute('PRAGMA table_info(bids)')
cols = cur.fetchall()
print('Bids columns:', [c['name'] for c in cols])

# Count bids
cur.execute('SELECT COUNT(*) FROM bids')
total_bids = cur.fetchone()[0]
print(f'Total bids: {total_bids}')

# Check transactions structure  
cur.execute('PRAGMA table_info(transactions)')
cols = cur.fetchall()
print('Transaction columns:', [c['name'] for c in cols])

conn.close()

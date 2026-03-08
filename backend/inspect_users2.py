import sqlite3
conn = sqlite3.connect('ecotrade.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute('''SELECT u.id, u.full_name, u.email, u.role,
       h.id as hotel_id, h.hotel_name,
       r2.id as recycler_id, r2.company_name,
       d.id as driver_id
FROM users u
LEFT JOIN hotels h ON h.user_id = u.id
LEFT JOIN recyclers r2 ON r2.user_id = u.id
LEFT JOIN drivers d ON d.user_id = u.id
ORDER BY u.role, u.id LIMIT 50''')
for r in cur.fetchall():
    pid = r['hotel_id'] or r['recycler_id'] or r['driver_id'] or '-'
    pname = r['hotel_name'] or r['company_name'] or '-'
    print(f'{r["email"]:<35} role={r["role"]:<10} pid={str(pid):<5} {pname}')

print()
# Check bids distribution
cur.execute('''
SELECT r2.company_name, r2.id, COUNT(b.id) as bids, SUM(b.amount) as total
FROM recyclers r2
LEFT JOIN bids b ON b.recycler_id = r2.id
GROUP BY r2.id ORDER BY r2.id
''')
print('Recycler bids:')
for r in cur.fetchall():
    print(f'  recycler_id={r["id"]} bids={r["bids"]} total=RWF{r["total"] or 0:.0f} {r["company_name"]}')

print()
# Check collections
cur.execute('SELECT COUNT(*) FROM collections')
print(f'Collections: {cur.fetchone()[0]}')
cur.execute('SELECT COUNT(*) FROM routes')
print(f'Routes: {cur.fetchone()[0]}')
cur.execute('SELECT COUNT(*) FROM vehicles')
print(f'Vehicles: {cur.fetchone()[0]}')

conn.close()

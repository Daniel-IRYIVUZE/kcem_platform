import sqlite3
conn = sqlite3.connect('ecotrade.db')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in cur.fetchall()]
print('Tables:', tables)
print()
for t in ['users', 'roles', 'recyclers', 'drivers', 'hotels', 'bids', 'transactions', 'notifications', 'inventory_items']:
    if t in tables:
        cur.execute(f'PRAGMA table_info({t})')
        cols = [c[1] for c in cur.fetchall()]
        cur.execute(f'SELECT COUNT(*) FROM {t}')
        count = cur.fetchone()[0]
        print(f'{t} ({count} rows): {cols}')
conn.close()

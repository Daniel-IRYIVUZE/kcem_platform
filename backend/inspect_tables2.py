import sqlite3
conn = sqlite3.connect('ecotrade.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
for t in ['collections', 'vehicles', 'routes', 'route_stops', 'messages', 'conversations']:
    try:
        cur.execute(f'PRAGMA table_info({t})')
        cols = cur.fetchall()
        cur.execute(f'SELECT COUNT(*) FROM {t}')
        count = cur.fetchone()[0]
        print(f'\n{t} ({count} rows):')
        for c in cols:
            print(f'  {c["name"]} {c["type"]}')
    except Exception as e:
        print(f'{t}: error - {e}')
conn.close()

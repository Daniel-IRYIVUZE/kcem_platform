import sqlite3
conn = sqlite3.connect('ecotrade.db')
cur = conn.cursor()
cur.execute("UPDATE collections SET status='en_route' WHERE status='en-route'")
print('Fixed rows:', cur.rowcount)
conn.commit()
cur.execute('SELECT id, status FROM collections')
for row in cur.fetchall():
    print(f'  col {row[0]} -> {row[1]}')
conn.close()
print('Done.')

"""Migration: add quantity column to bids table."""
import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), "ecotrade.db")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Check if column already exists
cursor.execute("PRAGMA table_info(bids)")
cols = [row[1] for row in cursor.fetchall()]

if "quantity" not in cols:
    cursor.execute("ALTER TABLE bids ADD COLUMN quantity REAL")
    conn.commit()
    print("Added 'quantity' column to bids table.")
else:
    print("Column 'quantity' already exists — nothing to do.")

conn.close()

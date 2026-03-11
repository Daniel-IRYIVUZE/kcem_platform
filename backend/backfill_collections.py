#!/usr/bin/env python3
"""Backfill Collection records for already-accepted bids that don't have one."""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.bid import Bid, BidStatus
from app.models.collection import Collection, CollectionStatus

db = SessionLocal()
try:
    accepted_bids = db.query(Bid).filter(Bid.status == BidStatus.accepted).all()
    print(f"Found {len(accepted_bids)} accepted bids")
    created = 0
    for bid in accepted_bids:
        listing = bid.listing
        if not listing:
            print(f"  Bid {bid.id}: no listing, skipping")
            continue
        existing = db.query(Collection).filter(
            Collection.listing_id == bid.listing_id,
            Collection.recycler_id == bid.recycler_id,
        ).first()
        if existing:
            print(f"  Bid {bid.id} -> Collection already exists (id={existing.id}, status={existing.status})")
            continue
        col = Collection(
            listing_id=bid.listing_id,
            hotel_id=listing.hotel_id,
            recycler_id=bid.recycler_id,
            status=CollectionStatus.scheduled,
        )
        db.add(col)
        db.commit()
        db.refresh(col)
        print(f"  Bid {bid.id} -> Created Collection id={col.id} (listing={bid.listing_id}, recycler={bid.recycler_id})")
        created += 1
    print(f"\nDone. Created {created} new collection(s).")
finally:
    db.close()

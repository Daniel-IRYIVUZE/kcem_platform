"""routes/bids.py — Bidding endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_bid, crud_listing, crud_hotel, crud_recycler
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.bid import BidCreate, BidRead
from app.schemas.recycler import RecyclerCreate
from app.models.user import User, UserRole
from app.models.bid import Bid
from app.services.notification_service import notify_bid_placed, notify_bid_accepted

router = APIRouter(prefix="/bids", tags=["Bids"])
require_recycler_role = require_role(UserRole.recycler, UserRole.admin)
require_business = require_role(UserRole.business, UserRole.admin)


def enrich_bid(bid: Bid) -> dict:
    """Enrich a bid object with listing details for client response."""
    data = {
        'id': bid.id,
        'listing_id': bid.listing_id,
        'recycler_id': bid.recycler_id,
        'amount': bid.amount,
        'quantity': bid.quantity,
        'previous_amount': bid.previous_amount,
        'status': bid.status,
        'notes': bid.notes,
        'created_at': bid.created_at,
        'updated_at': bid.updated_at,
        'hotel_name': None,
        'waste_type': None,
        'volume': None,
        'unit': None,
    }
    if bid.listing:
        data['hotel_name'] = bid.listing.hotel_name
        data['waste_type'] = str(bid.listing.waste_type.value) if bid.listing.waste_type else None
        data['volume'] = bid.listing.volume
        data['unit'] = bid.listing.unit
    return data


@router.post("/", response_model=BidRead, status_code=201,
             dependencies=[Depends(require_recycler_role)])
def place_bid(payload: BidCreate, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_active_user)):
    recycler = _ensure_recycler_profile(db, current_user)
    existing = crud_bid.get_recycler_bid_on_listing(db, recycler_id=recycler.id,
                                                    listing_id=payload.listing_id)
    if existing:
        raise HTTPException(409, "You already have an active bid on this listing.")
    listing = crud_listing.get(db, payload.listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found.")
    bid = crud_bid.create(db, obj_in=payload, recycler_id=recycler.id)
    crud_listing.update_bid_stats(db, listing=listing, new_bid_amount=bid.amount)
    # notify hotel
    notify_bid_placed(db, hotel_user_id=listing.hotel.user_id,
                      recycler_name=recycler.company_name,
                      listing_title=listing.title,
                      amount=bid.amount,
                      listing_id=listing.id)
    # Refresh to ensure listing relationship is loaded
    db.refresh(bid)
    return enrich_bid(bid)


@router.get("/mine", response_model=list[BidRead],
            dependencies=[Depends(require_recycler_role)])
def my_bids(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
            current_user: User = Depends(get_current_active_user)):
    recycler = _ensure_recycler_profile(db, current_user)
    bids = crud_bid.get_by_recycler(db, recycler_id=recycler.id, skip=skip, limit=limit)
    return [enrich_bid(bid) for bid in bids]


@router.get("/listing/{listing_id}", response_model=list[BidRead])
def bids_for_listing(listing_id: int, db: Session = Depends(get_db)):
    """Public endpoint — no auth required so marketplace can show live bid counts."""
    bids = crud_bid.get_by_listing(db, listing_id=listing_id)
    return [enrich_bid(bid) for bid in bids]


@router.post("/{bid_id}/accept", response_model=BidRead,
             dependencies=[Depends(require_business)])
def accept_bid(bid_id: int, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_active_user)):
    bid = crud_bid.get(db, bid_id)
    if not bid:
        raise HTTPException(404, "Bid not found.")
    hotel = crud_hotel.get_by_user(db, current_user.id)
    if not hotel or bid.listing.hotel_id != hotel.id:
        raise HTTPException(403, "Not your listing.")
    # Determine if this is a partial bid before accepting (accept() mutates bid.status)
    listing_volume = bid.listing.volume if bid.listing else None
    is_partial = (
        bid.quantity is not None
        and listing_volume is not None
        and bid.quantity < listing_volume
    )
    bid = crud_bid.accept(db, bid=bid)
    crud_listing.accept_bid(db, listing=bid.listing, bid_id=bid_id, partial=is_partial)

    # Auto-create a Collection so the recycler can assign a driver
    from app.models.collection import Collection, CollectionStatus
    existing = db.query(Collection).filter(
        Collection.listing_id == bid.listing_id,
        Collection.recycler_id == bid.recycler_id,
    ).first()
    new_col = existing
    if not existing:
        new_col = Collection(
            listing_id=bid.listing_id,
            hotel_id=bid.listing.hotel_id,
            recycler_id=bid.recycler_id,
            status=CollectionStatus.scheduled,
        )
        db.add(new_col)
        db.commit()
        db.refresh(new_col)

    # Auto-assign a nearby available driver immediately (best-effort, no error raised)
    try:
        from app.services.assignment_service import auto_assign_collections
        auto_assign_collections(db, recycler_id=bid.recycler_id, balance_load=True, apply=True)
    except Exception:
        pass  # Auto-assign is best-effort; recycler can always assign manually

    notify_bid_accepted(db, recycler_user_id=bid.recycler.user_id,
                        hotel_name=hotel.hotel_name,
                        listing_title=bid.listing.title,
                        bid_id=bid_id)
    db.refresh(bid)
    return enrich_bid(bid)


@router.post("/{bid_id}/withdraw", response_model=BidRead,
             dependencies=[Depends(require_recycler_role)])
def withdraw_bid(bid_id: int, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    bid = crud_bid.get(db, bid_id)
    if not bid:
        raise HTTPException(404, "Bid not found.")
    recycler = _ensure_recycler_profile(db, current_user)
    if not recycler or bid.recycler_id != recycler.id:
        raise HTTPException(403, "Not your bid.")
    bid = crud_bid.withdraw(db, bid=bid)
    db.refresh(bid)
    return enrich_bid(bid)


@router.patch("/{bid_id}/increase", response_model=BidRead,
              dependencies=[Depends(require_recycler_role)])
def increase_bid(bid_id: int, payload: dict, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    bid = crud_bid.get(db, bid_id)
    if not bid:
        raise HTTPException(404, "Bid not found.")
    recycler = _ensure_recycler_profile(db, current_user)
    if not recycler or bid.recycler_id != recycler.id:
        raise HTTPException(403, "Not your bid.")
    bid = crud_bid.increase_bid(db, bid=bid, new_amount=payload["amount"])
    db.refresh(bid)
    return enrich_bid(bid)


@router.post("/backfill-collections", status_code=200,
             dependencies=[Depends(require_recycler_role)])
def backfill_collections_for_accepted_bids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create missing Collection records for already-accepted bids (one-time repair)."""
    from app.models.bid import BidStatus
    from app.models.collection import Collection, CollectionStatus

    recycler = _ensure_recycler_profile(db, current_user)
    query = db.query(Bid).filter(
        Bid.status == BidStatus.accepted,
        Bid.recycler_id == recycler.id,
    )
    created = 0
    for bid in query.all():
        if not bid.listing:
            continue
        existing = db.query(Collection).filter(
            Collection.listing_id == bid.listing_id,
            Collection.recycler_id == bid.recycler_id,
        ).first()
        if not existing:
            col = Collection(
                listing_id=bid.listing_id,
                hotel_id=bid.listing.hotel_id,
                recycler_id=bid.recycler_id,
                status=CollectionStatus.scheduled,
            )
            db.add(col)
            created += 1
    db.commit()
    return {"created": created, "message": f"Created {created} collection(s) for accepted bids."}


def _ensure_recycler_profile(db: Session, current_user: User):
    recycler = crud_recycler.get_by_user(db, current_user.id)
    if recycler:
        return recycler

    return crud_recycler.create(
        db,
        obj_in=RecyclerCreate(
            company_name=f"{(current_user.full_name or 'Recycler').strip()} Recycling",
            address="Kigali",
            city="Kigali",
            phone=current_user.phone,
        ),
        user_id=current_user.id,
    )

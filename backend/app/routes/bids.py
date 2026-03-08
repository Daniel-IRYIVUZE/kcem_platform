"""routes/bids.py — Bidding endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_bid, crud_listing, crud_hotel, crud_recycler
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.bid import BidCreate, BidRead
from app.models.user import User, UserRole
from app.services.notification_service import notify_bid_placed, notify_bid_accepted

router = APIRouter(prefix="/bids", tags=["Bids"])
require_recycler_role = require_role(UserRole.recycler, UserRole.admin)
require_business = require_role(UserRole.business, UserRole.admin)


@router.post("/", response_model=BidRead, status_code=201,
             dependencies=[Depends(require_recycler_role)])
def place_bid(payload: BidCreate, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_active_user)):
    recycler = crud_recycler.get_by_user(db, current_user.id)
    if not recycler:
        raise HTTPException(400, "Recycler profile required to place bids.")
    existing = crud_bid.get_recycler_bid_on_listing(db, recycler_id=recycler.id,
                                                    listing_id=payload.listing_id)
    if existing:
        raise HTTPException(409, "You already have an active bid on this listing.")
    listing = crud_listing.get(db, payload.listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found.")
    bid = crud_bid.create(db, obj_in=payload, recycler_id=recycler.id)
    crud_listing.update_bid_stats(db, listing_id=listing.id)
    # notify hotel
    notify_bid_placed(db, hotel_user_id=listing.hotel.user_id,
                      recycler_name=recycler.company_name,
                      listing_title=listing.title,
                      amount=bid.amount,
                      listing_id=listing.id)
    return bid


@router.get("/mine", response_model=list[BidRead],
            dependencies=[Depends(require_recycler_role)])
def my_bids(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
            current_user: User = Depends(get_current_active_user)):
    recycler = crud_recycler.get_by_user(db, current_user.id)
    if not recycler:
        return []
    return crud_bid.get_by_recycler(db, recycler_id=recycler.id, skip=skip, limit=limit)


@router.get("/listing/{listing_id}", response_model=list[BidRead])
def bids_for_listing(listing_id: int, db: Session = Depends(get_db)):
    """Public endpoint — no auth required so marketplace can show live bid counts."""
    return crud_bid.get_by_listing(db, listing_id=listing_id)


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
    bid = crud_bid.accept(db, bid_id=bid_id)
    crud_listing.accept_bid(db, listing_id=bid.listing_id, bid_id=bid_id)
    notify_bid_accepted(db, recycler_user_id=bid.recycler.user_id,
                        hotel_name=hotel.name,
                        listing_title=bid.listing.title,
                        bid_id=bid_id)
    return bid


@router.post("/{bid_id}/withdraw", response_model=BidRead,
             dependencies=[Depends(require_recycler_role)])
def withdraw_bid(bid_id: int, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    bid = crud_bid.get(db, bid_id)
    if not bid:
        raise HTTPException(404, "Bid not found.")
    recycler = crud_recycler.get_by_user(db, current_user.id)
    if not recycler or bid.recycler_id != recycler.id:
        raise HTTPException(403, "Not your bid.")
    return crud_bid.withdraw(db, bid_id=bid_id)


@router.patch("/{bid_id}/increase", response_model=BidRead,
              dependencies=[Depends(require_recycler_role)])
def increase_bid(bid_id: int, payload: dict, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    bid = crud_bid.get(db, bid_id)
    if not bid:
        raise HTTPException(404, "Bid not found.")
    recycler = crud_recycler.get_by_user(db, current_user.id)
    if not recycler or bid.recycler_id != recycler.id:
        raise HTTPException(403, "Not your bid.")
    return crud_bid.increase_bid(db, bid_id=bid_id, new_amount=payload["amount"])

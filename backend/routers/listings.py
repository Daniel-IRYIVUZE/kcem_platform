"""
routers/listings.py — Waste listing CRUD + bidding
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from utils.deps import get_current_user
import models
import schemas

router = APIRouter(prefix="/api/listings", tags=["listings"])

_DURATION_MAP = {"24h": 1, "48h": 2, "72h": 3, "7d": 7}


@router.post("/", response_model=schemas.WasteListingOut, status_code=201)
def create_listing(
    payload: schemas.WasteListingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    days = _DURATION_MAP.get(payload.auction_duration, 1)
    hotel_name = ""
    if current_user.hotel_profile:
        hotel_name = current_user.hotel_profile.business_name
    else:
        hotel_name = current_user.full_name

    listing = models.WasteListing(
        hotel_id=current_user.id,
        hotel_name=hotel_name,
        expires_at=datetime.utcnow() + timedelta(days=days),
        **payload.model_dump(),
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@router.get("/", response_model=list[schemas.WasteListingOut])
def list_listings(
    skip: int = 0,
    limit: int = 50,
    status: str | None = None,
    waste_type: str | None = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    q = db.query(models.WasteListing)
    if status:
        q = q.filter(models.WasteListing.status == status)
    if waste_type:
        q = q.filter(models.WasteListing.waste_type == waste_type)
    return q.order_by(models.WasteListing.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{listing_id}", response_model=schemas.WasteListingOut)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    listing = db.query(models.WasteListing).filter(models.WasteListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.put("/{listing_id}", response_model=schemas.WasteListingOut)
def update_listing(
    listing_id: int,
    payload: schemas.WasteListingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listing = db.query(models.WasteListing).filter(models.WasteListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.hotel_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(listing, field, value)
    db.commit()
    db.refresh(listing)
    return listing


@router.delete("/{listing_id}", status_code=204)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listing = db.query(models.WasteListing).filter(models.WasteListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.hotel_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(listing)
    db.commit()


# ---- Bids sub-resource ----

@router.post("/{listing_id}/bids", response_model=schemas.BidOut, status_code=201)
def place_bid(
    listing_id: int,
    payload: schemas.BidCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listing = db.query(models.WasteListing).filter(models.WasteListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status != models.ListingStatus.open:
        raise HTTPException(status_code=400, detail="Listing is not open for bidding")

    recycler_name = ""
    if current_user.recycler_profile:
        recycler_name = current_user.recycler_profile.company_name
    else:
        recycler_name = current_user.full_name

    bid = models.Bid(
        listing_id=listing_id,
        recycler_id=current_user.id,
        recycler_name=recycler_name,
        **payload.model_dump(),
    )
    db.add(bid)
    db.commit()
    db.refresh(bid)
    return bid


@router.get("/{listing_id}/bids", response_model=list[schemas.BidOut])
def get_bids(
    listing_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    return db.query(models.Bid).filter(models.Bid.listing_id == listing_id).all()


@router.post("/{listing_id}/bids/{bid_id}/accept", response_model=schemas.BidOut)
def accept_bid(
    listing_id: int,
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Hotel accepts a specific bid — marks the listing as assigned."""
    listing = db.query(models.WasteListing).filter(models.WasteListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.hotel_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    bid = db.query(models.Bid).filter(
        models.Bid.id == bid_id, models.Bid.listing_id == listing_id
    ).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    # Mark winning bid
    bid.status = models.BidStatus.won
    # Mark other bids as lost
    db.query(models.Bid).filter(
        models.Bid.listing_id == listing_id, models.Bid.id != bid_id
    ).update({"status": models.BidStatus.lost})
    # Assign listing
    listing.status = models.ListingStatus.assigned
    listing.assigned_recycler = bid.recycler_name

    db.commit()
    db.refresh(bid)
    return bid


@router.get("/my", response_model=list[schemas.WasteListingOut])
def my_listings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all listings created by the current hotel user."""
    return (
        db.query(models.WasteListing)
        .filter(models.WasteListing.hotel_id == current_user.id)
        .order_by(models.WasteListing.created_at.desc())
        .all()
    )


@router.patch("/{listing_id}/bids/{bid_id}", response_model=schemas.BidOut)
def update_bid(
    listing_id: int,
    bid_id: int,
    payload: schemas.BidUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    bid = db.query(models.Bid).filter(
        models.Bid.id == bid_id, models.Bid.listing_id == listing_id
    ).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    if bid.recycler_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(bid, field, value)
    db.commit()
    db.refresh(bid)
    return bid

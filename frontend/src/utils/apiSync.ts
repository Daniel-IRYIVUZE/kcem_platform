// utils/apiSync.ts — Syncs real backend data into localStorage dataStore
// Called on login (online) and on reconnect. Falls back gracefully if offline.
import { listingsAPI, collectionsAPI, transactionsAPI, usersAPI, bidsAPI, inventoryAPI } from '../services/api';
import { saveAll } from './dataStore';
import type {
  WasteListing as DSListing,
  Collection as DSCollection,
  Transaction as DSTx,
  PlatformUser as DSUser,
} from './dataStore';

const SYNC_TS_KEY = 'ecotrade_last_sync';
const SYNC_TTL = 24 * 60 * 60 * 1000; // 24 hours

/** Returns true if cached data is still fresh (< 24 hours old). */
export function isCacheValid(): boolean {
  const ts = localStorage.getItem(SYNC_TS_KEY);
  if (!ts) return false;
  return Date.now() - Number(ts) < SYNC_TTL;
}

/** Marks the cache as fresh right now. */
function markSynced(): void {
  localStorage.setItem(SYNC_TS_KEY, String(Date.now()));
}

function toRole(r: string): DSUser['role'] {
  if (r === 'hotel') return 'business';
  return r as DSUser['role'];
}

/** Fetch data from the API and write it into the localStorage dataStore. */
export async function syncFromAPI(userRole: string): Promise<void> {
  // Fire all requests in parallel — no sequential awaits
  const [listingsResult, collectionsResult, txResult, usersResult, bidsResult, invResult] =
    await Promise.allSettled([
      // Listings
      userRole === 'business' ? listingsAPI.mine() : listingsAPI.list({ limit: 100 }),
      // Collections
      collectionsAPI.list({ limit: 100 }),
      // Transactions
      userRole === 'admin' ? transactionsAPI.list({ limit: 100 }) : transactionsAPI.mine({ limit: 100 }),
      // Users (admin only — others get null)
      userRole === 'admin' ? usersAPI.list({ limit: 200 }) : Promise.resolve(null),
      // Recycler bids (recycler only)
      userRole === 'recycler' ? bidsAPI.mine({ limit: 100 }) : Promise.resolve(null),
      // Recycler inventory (recycler only)
      userRole === 'recycler' ? inventoryAPI.mine() : Promise.resolve(null),
    ]);

  if (listingsResult.status === 'fulfilled' && listingsResult.value) {
    const dsListings: DSListing[] = listingsResult.value.map(l => ({
      id: String(l.id),
      businessId: String(l.hotel_id),
      businessName: l.hotel_name,
      hotelName: l.hotel_name,
      hotelId: String(l.hotel_id),
      wasteType: (l.waste_type || 'Mixed') as DSListing['wasteType'],
      volume: l.volume,
      unit: l.unit as 'kg' | 'liters',
      quality: (l.quality || 'B') as DSListing['quality'],
      minBid: l.min_bid,
      reservePrice: l.reserve_price || 0,
      auctionDuration: l.auction_duration || '24h',
      status: l.status as DSListing['status'],
      location: l.location || '',
      assignedRecycler: l.assigned_recycler,
      assignedDriver: l.assigned_driver,
      collectionDate: l.collection_date,
      collectionTime: l.collection_time,
      actualWeight: l.actual_weight,
      createdAt: l.created_at,
      expiresAt: l.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      contactPerson: l.contact_person || '',
      specialInstructions: l.special_instructions || '',
      autoAcceptAbove: 0,
      photos: (() => {
        if (l.images && l.images.length > 0) return l.images.map((img) => img.url).filter(Boolean);
        if (l.image_url) return [l.image_url];
        return [];
      })(),
      bids: [],
    }));
    saveAll('listings', dsListings);
  }

  if (collectionsResult.status === 'fulfilled' && collectionsResult.value) {
    const dsCols: DSCollection[] = collectionsResult.value.map(c => ({
      id: String(c.id),
      listingId: c.listing_id ? String(c.listing_id) : '',
      businessName: c.hotel_name || '',
      hotelName: c.hotel_name,
      recyclerName: c.recycler_name || '',
      driverName: c.driver_name || '',
      driverId: c.driver_id ? String(c.driver_id) : '',
      wasteType: c.waste_type || '',
      volume: c.volume || 0,
      status: c.status as DSCollection['status'],
      scheduledDate: c.scheduled_date || '',
      scheduledTime: c.scheduled_time || '00:00',
      completedAt: c.completed_at,
      actualWeight: c.actual_weight,
      rating: c.rating,
      notes: c.notes || '',
      location: c.location || '',
      earnings: c.earnings || 0,
      proofPhotos: [],
      createdAt: c.created_at,
    }));
    saveAll('collections', dsCols);
  }

  if (txResult.status === 'fulfilled' && txResult.value) {
    const dsTxs: DSTx[] = txResult.value.map(t => ({
      id: String(t.id),
      listingId: t.listing_id ? String(t.listing_id) : '',
      from: t.from_user || '',
      to: t.to_user || '',
      wasteType: t.waste_type || '',
      volume: t.volume || 0,
      amount: t.gross_amount || 0,
      fee: t.fee || 0,
      status: t.status as DSTx['status'],
      date: t.created_at,
      receipt: t.receipt,
    }));
    saveAll('transactions', dsTxs);
  }

  if (usersResult.status === 'fulfilled' && usersResult.value) {
    const dsUsers: DSUser[] = usersResult.value.map(u => ({
      id: String(u.id),
      name: u.full_name,
      email: u.email,
      phone: u.phone || '',
      role: toRole(u.role),
      status: u.status as DSUser['status'],
      verified: u.is_verified,
      createdAt: u.created_at,
      location: '',
      joinDate: u.created_at,
      lastActive: new Date().toISOString(),
      avatar: '/images/default-avatar.svg',
      businessName: u.hotel_profile?.business_name,
      companyName: u.recycler_profile?.company_name,
    }));
    saveAll('users', dsUsers);
  }

  if (bidsResult.status === 'fulfilled' && bidsResult.value) {
    saveAll('recycler_bids', bidsResult.value);
  }

  if (invResult.status === 'fulfilled' && invResult.value) {
    saveAll('recycler_inventory', invResult.value);
  }

  markSynced();
  window.dispatchEvent(new Event('ecotrade_data_change'));
}

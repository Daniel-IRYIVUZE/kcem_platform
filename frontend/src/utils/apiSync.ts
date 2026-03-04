// utils/apiSync.ts — Syncs real backend data into localStorage dataStore
// Called on login when the backend is online. Falls back gracefully if offline.
import { listingsAPI, collectionsAPI, transactionsAPI, usersAPI, routesAPI } from '../services/api';
import { saveAll } from './dataStore';
import type {
  WasteListing as DSListing,
  Collection as DSCollection,
  Transaction as DSTx,
  PlatformUser as DSUser,
  DriverRoute as DSRoute,
} from './dataStore';

function toRole(r: string): DSUser['role'] {
  if (r === 'hotel') return 'business';
  return r as DSUser['role'];
}

/** Fetch data from the API and write it into the localStorage dataStore. */
export async function syncFromAPI(userRole: string): Promise<void> {
  try {
    // ── Listings ────────────────────────────────────────────────────────────
    const apiListings = await listingsAPI.list({ limit: 100 });
    const dsListings: DSListing[] = apiListings.map(l => ({
      id: String(l.id),
      hotelId: String(l.hotel_id),
      hotelName: l.hotel_name,
      wasteType: l.waste_type,
      volume: l.volume,
      unit: l.unit,
      quality: l.quality,
      minBid: l.min_bid,
      currentBid: l.min_bid,
      reservePrice: l.reserve_price,
      auctionDuration: l.auction_duration,
      status: l.status as DSListing['status'],
      location: l.location || '',
      assignedRecycler: l.assigned_recycler,
      assignedDriver: l.assigned_driver,
      collectionDate: l.collection_date,
      collectionTime: l.collection_time,
      actualWeight: l.actual_weight,
      createdAt: l.created_at,
      expiresAt: l.expires_at,
      contactPerson: l.contact_person,
      specialInstructions: l.special_instructions,
      bids: [],
    }));
    saveAll('listings', dsListings);
  } catch { /* offline */ }

  try {
    // ── Collections ──────────────────────────────────────────────────────────
    const apiCols = await collectionsAPI.list({ limit: 100 });
    const dsCols: DSCollection[] = apiCols.map(c => ({
      id: String(c.id),
      listingId: c.listing_id ? String(c.listing_id) : undefined,
      hotelName: c.hotel_name,
      recyclerName: c.recycler_name,
      driverName: c.driver_name,
      driverId: c.driver_id ? String(c.driver_id) : undefined,
      wasteType: c.waste_type,
      volume: c.volume,
      status: c.status as DSCollection['status'],
      scheduledDate: c.scheduled_date,
      scheduledTime: c.scheduled_time,
      completedAt: c.completed_at,
      actualWeight: c.actual_weight,
      rating: c.rating,
      notes: c.notes,
      location: c.location,
      earnings: c.earnings,
      createdAt: c.created_at,
    }));
    saveAll('collections', dsCols);
  } catch { /* offline */ }

  try {
    // ── Transactions ─────────────────────────────────────────────────────────
    const apiTxs = await transactionsAPI.list({ limit: 100 });
    const dsTxs: DSTx[] = apiTxs.map(t => ({
      id: String(t.id),
      listingId: t.listing_id ? String(t.listing_id) : undefined,
      from: t.from_user,
      to: t.to_user,
      wasteType: t.waste_type,
      volume: t.volume,
      amount: t.amount,
      fee: t.fee,
      status: t.status as DSTx['status'],
      date: t.created_at,
      receipt: t.receipt,
    }));
    saveAll('transactions', dsTxs);
  } catch { /* offline */ }

  // Users endpoint is admin-only
  if (userRole === 'admin') {
    try {
      const apiUsers = await usersAPI.list({ limit: 200 });
      const dsUsers: DSUser[] = apiUsers.map(u => ({
        id: String(u.id),
        name: u.full_name,
        email: u.email,
        phone: u.phone,
        role: toRole(u.role),
        status: u.status as DSUser['status'],
        verified: u.is_verified,
        createdAt: u.created_at,
        location: '',
        businessName: u.hotel_profile?.business_name,
        companyName: u.recycler_profile?.company_name,
      }));
      saveAll('users', dsUsers);
    } catch { /* offline */ }
  }

  // Driver routes — only for driver role
  if (userRole === 'driver') {
    try {
      const apiRoutes = await routesAPI.list({ limit: 50 });
      const dsRoutes: DSRoute[] = apiRoutes.map(r => ({
        id: String(r.id),
        driverId: String(r.driver_id),
        date: r.date,
        status: r.status as DSRoute['status'],
        totalDistance: r.total_distance,
        estimatedEarnings: r.estimated_earnings,
        actualEarnings: r.actual_earnings,
        startTime: r.start_time,
        endTime: r.end_time,
        createdAt: r.created_at,
        stops: (r.stops || []).map(s => ({
          id: String(s.id),
          routeId: String(s.route_id),
          hotelName: s.hotel_name,
          location: s.location,
          wasteType: s.waste_type,
          volume: s.volume,
          eta: s.eta,
          status: s.status as 'pending' | 'arrived' | 'collecting' | 'completed' | 'skipped',
          contactPerson: s.contact_person,
          contactPhone: s.contact_phone,
          specialInstructions: s.special_instructions,
          actualWeight: s.actual_weight,
          completedAt: s.completed_at,
        })),
      }));
      saveAll('routes', dsRoutes);
    } catch { /* offline */ }
  }

  window.dispatchEvent(new Event('ecotrade_data_change'));
}

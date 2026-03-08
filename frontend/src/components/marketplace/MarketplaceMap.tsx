// components/marketplace/MarketplaceMap.tsx
// One cluster per business: individual waste-type coloured pins, card popup on click.
// Lines drawn between every pair of business clusters with km distance labels.
import { useEffect, useRef, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';

interface Listing {
  id: string | number;
  business?: string;
  hotel?: string;
  type: string;
  category?: string;
  volume: number;
  currentBid: number;
  coordinates: { lat: number; lng: number };
  quality?: string;
}

interface MarketplaceMapProps {
  listings: Listing[];
  onListingClick: (listing: Listing) => void;
  center: { lat: number; lng: number };
}

// Colour per waste type
const WASTE_COLORS: Record<string, string> = {
  UCO:       '#0891b2',
  Glass:     '#2563eb',
  Paper:     '#65a30d',
  Cardboard: '#d97706',
  Mixed:     '#7c3aed',
  Plastic:   '#059669',
  Metal:     '#dc2626',
  Organic:   '#84cc16',
};

function getColorKey(type: string, category?: string): string {
  const raw = String(category || type || '').toLowerCase();
  if (raw.includes('uco') || raw.includes('cooking')) return 'UCO';
  if (raw.includes('glass'))     return 'Glass';
  if (raw.includes('cardboard')) return 'Cardboard';
  if (raw.includes('paper'))     return 'Paper';
  if (raw.includes('plastic'))   return 'Plastic';
  if (raw.includes('metal'))     return 'Metal';
  if (raw.includes('organic'))   return 'Organic';
  return 'Mixed';
}

// Haversine distance in km
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface HotelGroup {
  name: string;
  lat: number;
  lng: number;
  listings: Listing[];
  wasteTypes: string[];
}

function groupByBusiness(listings: Listing[]): HotelGroup[] {
  const map = new Map<string, HotelGroup>();
  listings.forEach(l => {
    const { lat, lng } = l.coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return;
    // Key by business/hotel name so all listings from the same hotel cluster together
    const name = l.business || l.hotel || 'Hotel';
    const key  = name.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, { name, lat, lng, listings: [], wasteTypes: [] });
    }
    const g = map.get(key)!;
    g.listings.push(l);
    const ck = getColorKey(l.type, l.category);
    if (!g.wasteTypes.includes(ck)) g.wasteTypes.push(ck);
  });
  return Array.from(map.values());
}

function pillsHtml(wasteTypes: string[]): string {
  return wasteTypes.map(wt =>
    `<span style="display:inline-block;background:${WASTE_COLORS[wt] ?? '#888'};
      border-radius:3px;padding:1px 5px;font-size:9px;color:#fff;font-weight:700;margin:1px">${wt}</span>`
  ).join('');
}

function businessCardHtml(group: HotelGroup): string {
  const totalVol  = group.listings.reduce((s, l) => s + Math.round(l.volume), 0);
  const topBid    = Math.max(...group.listings.map(l => l.currentBid));
  const rows = group.listings.map(l => {
    const ck    = getColorKey(l.type, l.category);
    const color = WASTE_COLORS[ck] ?? '#888';
    return `
    <tr style="border-bottom:1px solid #f1f5f9">
      <td style="padding:5px 8px 5px 0;vertical-align:middle">
        <span style="display:inline-flex;align-items:center;gap:4px">
          <span style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block"></span>
          <span style="font-size:11px;font-weight:700;color:#0f172a">${ck}</span>
        </span>
      </td>
      <td style="padding:5px 8px 5px 0;font-size:12px;color:#475569">${Math.round(l.volume).toLocaleString()} kg</td>
      <td style="padding:5px 8px 5px 0;font-size:12px;color:#0891b2;font-weight:600">RWF ${l.currentBid.toLocaleString()}</td>
      <td style="padding:5px 0">
        <button onclick="window.__ecotrade_bid_${l.id}()"
          style="background:#0891b2;color:#fff;border:none;border-radius:6px;
                 padding:4px 12px;font-size:11px;cursor:pointer;white-space:nowrap;
                 transition:background 0.15s" onmouseover="this.style.background='#0e7490'" onmouseout="this.style.background='#0891b2'">
          Bid
        </button>
      </td>
    </tr>`;
  }).join('');

  return `
    <div style="font-family:system-ui,sans-serif;min-width:280px;max-width:340px">
      <div style="background:linear-gradient(135deg,#0891b2,#0e7490);padding:10px 12px 8px;border-radius:6px 6px 0 0;margin:-1px -1px 0">
        <p style="margin:0 0 2px;font-weight:800;font-size:14px;color:#fff">${group.name}</p>
        <div style="display:flex;gap:12px;font-size:11px;color:rgba(255,255,255,0.85)">
          <span>${group.listings.length} listing${group.listings.length !== 1 ? 's' : ''}</span>
          <span>${totalVol.toLocaleString()} kg total</span>
          <span>Top bid: RWF ${topBid.toLocaleString()}</span>
        </div>
      </div>
      <div style="padding:4px 0 2px">
        <table style="border-collapse:collapse;width:100%">${rows}</table>
      </div>
    </div>`;
}

const MarketplaceMap = ({ listings, onListingClick, center }: MarketplaceMapProps) => {
  const mapRef        = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const LeafletRef    = useRef<any>(null);
  const layersRef     = useRef<any[]>([]);

  const onListingClickRef = useRef(onListingClick);
  onListingClickRef.current = onListingClick;

  const listingsRef = useRef<Listing[]>(listings);
  listingsRef.current = listings;

  const refreshMarkers = useCallback((currentListings: Listing[]) => {
    const L   = LeafletRef.current;
    const map = leafletMapRef.current;
    if (!L || !map) return;

    // Remove previous dynamic layers
    layersRef.current.forEach(layer => { try { map.removeLayer(layer); } catch { /**/ } });
    layersRef.current = [];

    const groups = groupByBusiness(currentListings);
    if (groups.length === 0) { map.setView([-1.9441, 30.0619], 13); return; }

    // ── Register bid handlers ────────────────────────────────────────────────
    currentListings.forEach(l => {
      (window as any)[`__ecotrade_bid_${l.id}`] = () => {
        map.closePopup();
        onListingClickRef.current(l);
      };
    });

    // ── Lines between ALL cluster pairs ──────────────────────────────────────
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a  = groups[i];
        const b  = groups[j];
        const km = haversineKm(a.lat, a.lng, b.lat, b.lng);

        const line = L.polyline([[a.lat, a.lng], [b.lat, b.lng]], {
          color: '#06b6d4', weight: 1.5, dashArray: '6,5', opacity: 0.7,
        }).addTo(map);
        layersRef.current.push(line);

        // km label only for lines shorter than 5 km to avoid clutter
        if (km < 5) {
          const label = L.marker(
            [(a.lat + b.lat) / 2, (a.lng + b.lng) / 2],
            {
              icon: L.divIcon({
                className: '',
                html: `<div style="background:#06b6d4;border:1.5px solid #0891b2;
                                  border-radius:8px;padding:1px 7px;font-size:9px;font-weight:700;
                                  color:#fff;white-space:nowrap;
                                  box-shadow:0 1px 4px rgba(6,182,212,0.35)">${km.toFixed(1)} km</div>`,
                iconSize:   [52, 18],
                iconAnchor: [26, 9],
              }),
              interactive: false,
              zIndexOffset: -200,
            }
          ).addTo(map);
          layersRef.current.push(label);
        }
      }
    }

    // ── One cluster marker per business (individual coloured pins) ────────────
    groups.forEach(group => {
      // Place one teardrop pin per waste type, slightly offset so they're all visible
      const total = group.wasteTypes.length;
      group.wasteTypes.forEach((wt, idx) => {
        const color = WASTE_COLORS[wt] ?? '#888';
        // Small angular offset so pins fan out slightly (max 0.0004° ≈ 40 m)
        const angle  = total > 1 ? (idx / total) * 2 * Math.PI : 0;
        const offset = total > 1 ? 0.0003 : 0;
        const pinLat = group.lat + Math.cos(angle) * offset;
        const pinLng = group.lng + Math.sin(angle) * offset;

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:28px;height:28px;
            background:${color};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:2.5px solid #fff;
            box-shadow:0 2px 6px rgba(0,0,0,0.35);
          "></div>`,
          iconSize:    [28, 28],
          iconAnchor:  [14, 28],
          popupAnchor: [0, -32],
        });

        // All pins for same hotel share the same card popup
        const marker = L.marker([pinLat, pinLng], { icon })
          .bindPopup(businessCardHtml(group), {
            maxWidth: 360,
            className: 'eco-hotel-popup',
          })
          .addTo(map);

        layersRef.current.push(marker);
      });

      // Hotel name label (non-interactive, sits above the pins)
      const label = L.marker([group.lat, group.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="
            background:rgba(255,255,255,0.93);
            border:1.5px solid #0891b2;
            border-radius:8px;
            padding:2px 8px;
            font-size:10px;
            font-weight:700;
            color:#0f172a;
            white-space:nowrap;
            box-shadow:0 1px 4px rgba(0,0,0,0.18);
            transform:translateY(-36px);
          ">${group.name}</div>`,
          iconSize:   [0, 0],
          iconAnchor: [0, 0],
        }),
        interactive: false,
        zIndexOffset: 50,
      }).addTo(map);
      layersRef.current.push(label);
    });

    // ── Fit bounds ─────────────────────────────────────────────────────────────
    const bounds = groups.map(g => [g.lat, g.lng] as [number, number]);
    try { map.invalidateSize(); map.fitBounds(L.latLngBounds(bounds).pad(0.25), { maxZoom: 13 }); }
    catch { map.setView([-1.9441, 30.0619], 13); }
  }, []);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const initMap = async () => {
      const L = await import('leaflet');
      LeafletRef.current = L;

      const map = L.map(mapRef.current!, {
        center: [center.lat, center.lng], zoom: 13,
        zoomControl: true, attributionControl: true,
      });
      leafletMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>', maxZoom: 19,
      }).addTo(map);

      L.circleMarker([center.lat, center.lng], {
        radius: 7, fillColor: '#3b82f6', color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9,
      }).addTo(map).bindTooltip('Kigali City Centre');

      refreshMarkers(listingsRef.current);
    };
    initMap();
    return () => {
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; }
      LeafletRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render on filter change
  useEffect(() => {
    if (leafletMapRef.current && LeafletRef.current) refreshMarkers(listings);
  }, [listings, refreshMarkers]);

  const hotelCount = groupByBusiness(listings).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div ref={mapRef} className="h-[600px] w-full z-0" />
      <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap gap-3">
            {Object.entries(WASTE_COLORS).map(([type, color]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-gray-600 dark:text-gray-400 text-xs">{type}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span
                style={{ display: 'inline-block', width: 22, height: 0,
                         borderTop: '2px dashed #06b6d4', verticalAlign: 'middle' }}
              />
              Distance between hotels
            </span>
            <span>
              {listings.length} listing{listings.length !== 1 ? 's' : ''} ·{' '}
              {hotelCount} hotel{hotelCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceMap;

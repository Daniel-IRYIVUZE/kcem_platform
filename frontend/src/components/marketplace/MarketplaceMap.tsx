// components/marketplace/MarketplaceMap.tsx — Real Leaflet map
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface Listing {
  id: string | number;
  hotel: string;
  type: string;
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

// Waste-type colours
const WASTE_COLORS: Record<string, string> = {
  UCO: '#0891b2',
  Glass: '#2563eb',
  Paper: '#65a30d',
  Cardboard: '#d97706',
  Mixed: '#7c3aed',
};

const MarketplaceMap = ({ listings, onListingClick, center }: MarketplaceMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');

      const map = L.map(mapRef.current!, {
        center: [center.lat, center.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });
      leafletMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // User location marker
      L.circleMarker([center.lat, center.lng], {
        radius: 8,
        fillColor: '#3b82f6',
        color: 'white',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map).bindPopup('<strong>Your Location</strong>');

      // Listing markers
      listings.forEach(listing => {
        const color = WASTE_COLORS[listing.type] || '#0891b2';

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background:${color};
            width:32px;height:32px;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);border:3px solid white;
            box-shadow:0 3px 8px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
          "></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -35],
        });

        const marker = L.marker([listing.coordinates.lat, listing.coordinates.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:180px;padding:4px">
              <p style="font-weight:700;font-size:14px;color:#0891b2;margin:0 0 4px">${listing.hotel}</p>
              <p style="font-size:13px;color:#374151;margin:0 0 2px">
                <strong>${listing.type}</strong> · ${listing.volume} kg · Grade ${listing.quality || 'A'}
              </p>
              <p style="font-size:13px;font-weight:600;color:#065f46;margin:0">
                Current bid: RWF ${listing.currentBid.toLocaleString()}
              </p>
              <button onclick="window.__ecotrade_bid_${listing.id}()"
                style="margin-top:8px;background:#0891b2;color:white;border:none;border-radius:6px;padding:4px 12px;cursor:pointer;width:100%">
                Place Bid
              </button>
            </div>
          `);

        // Wire up the bid button in popup
        (window as any)[`__ecotrade_bid_${listing.id}`] = () => {
          map.closePopup();
          onListingClick(listing);
        };

        markersRef.current.push(marker);
      });
    };

    initMap();

    return () => {
      markersRef.current = [];
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update markers when listings change
  useEffect(() => {
    if (!leafletMapRef.current || markersRef.current.length === 0) return;
    // In a real implementation you'd diff and update markers here
  }, [listings]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div ref={mapRef} className="h-[600px] w-full z-0" />
      <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap gap-3">
            {Object.entries(WASTE_COLORS).map(([type, color]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-gray-600 dark:text-gray-400">{type}</span>
              </span>
            ))}
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {listings.length} listing{listings.length !== 1 ? 's' : ''} shown · Kigali, Rwanda
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceMap;

/** Haversine great-circle distance in kilometres. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (Math.PI * (lat2 - lat1)) / 180;
  const dLng = (Math.PI * (lng2 - lng1)) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((Math.PI * lat1) / 180) *
      Math.cos((Math.PI * lat2) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Estimated travel time at a city-average speed (default 30 km/h), minimum 1 min. */
export function etaMinutes(distKm: number, speedKmh = 30): number {
  return Math.max(1, Math.round((distKm / speedKmh) * 60));
}

/** Human-readable distance string: "450m" or "3.2km". */
export function formatDist(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
}

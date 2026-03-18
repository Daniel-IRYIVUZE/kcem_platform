import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, X, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationSearchProps {
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void;
  onClose?: () => void;
  onExpand?: (expanded: boolean) => void;
}

const LocationSearch = ({ onLocationSelect, onClose, onExpand }: LocationSearchProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const mapContainerId = 'location-map-container';

  const placeMarker = useCallback((lat: number, lng: number, name: string) => {
    if (!mapRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }

    // Add new marker
    markerRef.current = L.marker([lat, lng])
      .bindPopup(name)
      .addTo(mapRef.current)
      .openPopup();

    // Center map on marker
    mapRef.current.setView([lat, lng], 15);

    setSelectedLocation({ lat, lng, name });
    onLocationSelect?.({ lat, lng, name });
  }, [onLocationSelect]);

  // Initialize map
  useEffect(() => {
    if (!isExpanded) return;

    const mapElement = document.getElementById(mapContainerId);
    if (!mapElement || mapRef.current) return;

    // Default to Kigali, Rwanda
    const defaultLat = -1.9536;
    const defaultLng = 30.0605;

    mapRef.current = L.map(mapContainerId).setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Handle map clicks to place marker
    mapRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng;
      placeMarker(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isExpanded, placeMarker]);

  const fetchLocationSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&bounded=1&viewbox=29.5,-2.5,30.5,-1.0`
      );
      const data = await response.json();
      
      const formatted = data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
      
      setSuggestions(formatted);
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    fetchLocationSuggestions(value);
  };

  const selectSuggestion = (suggestion: typeof suggestions[0]) => {
    setSearchInput(suggestion.name);
    setSuggestions([]);
    placeMarker(suggestion.lat, suggestion.lng, suggestion.name);
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        placeMarker(latitude, longitude, `Your Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setSearchInput('Your Current Location');
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to access your location. Please enable location services.');
      }
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Select Your Location
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Help us find nearby collection points
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* ── Search Input ── */}
      <div className="mb-4">
        <label htmlFor="location" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Search Location
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            id="location"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
          />

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-sm text-gray-900 dark:text-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{suggestion.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Use Current Location Button ── */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        className="w-full mb-4 px-4 py-2.5 border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded-xl font-medium text-sm hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors flex items-center justify-center gap-2"
      >
        <MapPin className="w-4 h-4" />
        Use My Current Location
      </button>

      {/* ── Map Container ── */}
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            onExpand?.(true);
          }}
          className="w-full h-40 bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-150 dark:hover:bg-gray-750 transition-colors cursor-pointer"
        >
          <div className="text-center">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to open map</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">or select from search above</p>
          </div>
        </button>
      ) : (
        <div className="mb-4">
          <div id={mapContainerId} className="w-full h-64 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" />
        </div>
      )}

      {/* ── Selected Location Display ── */}
      {selectedLocation && (
        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedLocation.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selectedLocation.lat.toFixed(6) }, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;

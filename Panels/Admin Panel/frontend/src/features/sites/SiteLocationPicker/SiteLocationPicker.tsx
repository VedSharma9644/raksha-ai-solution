import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import "./SiteLocationPicker.css";

// No "places" library needed — we use Geocoding API only
const GOOGLE_MAPS_LIBRARIES: never[] = [];

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // India centre
const DEFAULT_ZOOM = 5;
const PINNED_ZOOM = 16;

export interface SiteLocationPickerProps {
  latitude: string;
  longitude: string;
  onLatChange: (val: string) => void;
  onLngChange: (val: string) => void;
  disabled?: boolean;
}

interface GeoResult {
  address: string;
  lat: number;
  lng: number;
}

export function SiteLocationPicker({
  latitude,
  longitude,
  onLatChange,
  onLngChange,
  disabled = false,
}: SiteLocationPickerProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(
    latitude && longitude
      ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
      : null,
  );

  // Search state
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [locationLabel, setLocationLabel] = useState("");

  // GPS state
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  // Init geocoder once map loads
  useEffect(() => {
    if (isLoaded && !geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Sync external lat/lng → marker (editing existing site)
  useEffect(() => {
    if (!latitude || !longitude) return;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return;
    setMarkerPos({ lat, lng });
  }, [latitude, longitude]);

  // ── Reverse geocode ────────────────────────────────────────────────────────
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    geocoderRef.current?.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setLocationLabel(results[0].formatted_address);
      }
    });
  }, []);

  // ── Address search via Geocoding API ──────────────────────────────────────
  function handleSearch() {
    const query = searchText.trim();
    if (!query || !geocoderRef.current) return;
    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);

    geocoderRef.current.geocode(
      { address: query, region: "in" },
      (results, status) => {
        setIsSearching(false);
        if (status === "OK" && results && results.length > 0) {
          const mapped: GeoResult[] = results.slice(0, 5).map((r) => ({
            address: r.formatted_address,
            lat: r.geometry.location.lat(),
            lng: r.geometry.location.lng(),
          }));
          if (mapped.length === 1) {
            applyGeoResult(mapped[0]);
          } else {
            setSearchResults(mapped);
          }
        } else {
          setSearchError("No results found. Try a more specific address.");
        }
      },
    );
  }

  function applyGeoResult(result: GeoResult) {
    const { lat, lng, address } = result;
    setMarkerPos({ lat, lng });
    onLatChange(lat.toFixed(6));
    onLngChange(lng.toFixed(6));
    setLocationLabel(address);
    setSearchResults([]);
    setSearchText(address);
    mapRef.current?.panTo({ lat, lng });
    mapRef.current?.setZoom(PINNED_ZOOM);
  }

  // ── Map click ──────────────────────────────────────────────────────────────
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (disabled || !e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });
      onLatChange(lat.toFixed(6));
      onLngChange(lng.toFixed(6));
      reverseGeocode(lat, lng);
    },
    [disabled, onLatChange, onLngChange, reverseGeocode],
  );

  // ── Marker drag ────────────────────────────────────────────────────────────
  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });
      onLatChange(lat.toFixed(6));
      onLngChange(lng.toFixed(6));
      reverseGeocode(lat, lng);
    },
    [onLatChange, onLngChange, reverseGeocode],
  );

  // ── Use my location (GPS) ──────────────────────────────────────────────────
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setGeoError("");

    let bestPosition: GeolocationPosition | null = null;
    let watchId: number;
    let gaveUp = false;

    const giveUp = () => {
      if (gaveUp) return;
      gaveUp = true;
      navigator.geolocation.clearWatch(watchId);
      if (bestPosition) {
        applyGPSPosition(bestPosition);
      } else {
        setGeoError("Could not get your exact location. Allow Precise Location in browser settings.");
        setIsLocating(false);
      }
    };

    const timeout = setTimeout(giveUp, 25000);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = pos;
        }
        if (pos.coords.accuracy <= 100) {
          clearTimeout(timeout);
          giveUp();
        }
      },
      (err) => {
        clearTimeout(timeout);
        navigator.geolocation.clearWatch(watchId);
        setGeoError(
          err.code === 1
            ? "Location access denied. Please allow location permission in your browser."
            : `Location error: ${err.message}`,
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 25000 },
    );
  }

  function applyGPSPosition(pos: GeolocationPosition) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    setMarkerPos({ lat, lng });
    onLatChange(lat.toFixed(6));
    onLngChange(lng.toFixed(6));
    mapRef.current?.panTo({ lat, lng });
    mapRef.current?.setZoom(PINNED_ZOOM);
    reverseGeocode(lat, lng);
    setIsLocating(false);
  }

  // ── Manual lat/lng input ───────────────────────────────────────────────────
  function handleLatInput(val: string) {
    onLatChange(val);
    const lat = parseFloat(val);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      setMarkerPos({ lat, lng });
      mapRef.current?.panTo({ lat, lng });
      mapRef.current?.setZoom(PINNED_ZOOM);
    }
  }

  function handleLngInput(val: string) {
    onLngChange(val);
    const lat = parseFloat(latitude);
    const lng = parseFloat(val);
    if (!isNaN(lat) && !isNaN(lng)) {
      setMarkerPos({ lat, lng });
      mapRef.current?.panTo({ lat, lng });
      mapRef.current?.setZoom(PINNED_ZOOM);
    }
  }

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="site-location-picker site-location-picker--error">
        <p>Failed to load Google Maps. Check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="site-location-picker site-location-picker--loading">
        <span className="site-location-picker__search-spinner" />
        <span>Loading map…</span>
      </div>
    );
  }

  const mapCenter = markerPos ?? DEFAULT_CENTER;
  const mapZoom = markerPos ? PINNED_ZOOM : DEFAULT_ZOOM;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="site-location-picker">

      {/* Search bar — uses Geocoding API, no legacy Places needed */}
      <div className="site-location-picker__search-wrap">
        <svg
          className="site-location-picker__search-icon"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          className="site-location-picker__search-input"
          placeholder="Search address (e.g. Connaught Place, Delhi)"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setSearchResults([]);
            setSearchError("");
          }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
          disabled={disabled}
          autoComplete="off"
        />
        <button
          type="button"
          className="site-location-picker__search-btn"
          onClick={handleSearch}
          disabled={disabled || isSearching || !searchText.trim()}
          title="Search"
        >
          {isSearching ? <span className="site-location-picker__search-spinner" style={{ width: 14, height: 14 }} /> : "Search"}
        </button>
      </div>

      {/* Search results dropdown */}
      {searchResults.length > 1 && (
        <ul className="site-location-picker__suggestions" role="listbox">
          {searchResults.map((r, i) => (
            <li
              key={i}
              className="site-location-picker__suggestion-item"
              role="option"
              aria-selected={false}
              onClick={() => applyGeoResult(r)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {r.address}
            </li>
          ))}
        </ul>
      )}
      {searchError && <p className="site-location-picker__geo-error" role="alert">{searchError}</p>}

      {/* Google Map */}
      <GoogleMap
        mapContainerClassName="site-location-picker__map"
        center={mapCenter}
        zoom={mapZoom}
        onClick={handleMapClick}
        onLoad={(map) => { mapRef.current = map; }}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: "cooperative",
        }}
      >
        {markerPos && (
          <Marker
            position={markerPos}
            draggable={!disabled}
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </GoogleMap>

      {/* Location label */}
      {locationLabel && (
        <p className="site-location-picker__label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {locationLabel}
        </p>
      )}

      {/* Lat / Lng + My location */}
      <div className="site-location-picker__coords">
        <div className="site-location-picker__coord-field">
          <label className="site-location-picker__coord-label" htmlFor="site-lat">Latitude</label>
          <input
            id="site-lat"
            type="text"
            className="site-location-picker__coord-input"
            placeholder="e.g. 28.6139"
            value={latitude}
            onChange={(e) => handleLatInput(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="site-location-picker__coord-field">
          <label className="site-location-picker__coord-label" htmlFor="site-lng">Longitude</label>
          <input
            id="site-lng"
            type="text"
            className="site-location-picker__coord-input"
            placeholder="e.g. 77.2090"
            value={longitude}
            onChange={(e) => handleLngInput(e.target.value)}
            disabled={disabled}
          />
        </div>

        <button
          type="button"
          className="site-location-picker__my-location-btn"
          onClick={handleUseMyLocation}
          disabled={disabled || isLocating}
          title="Use my current GPS location"
        >
          {isLocating ? (
            <span className="site-location-picker__search-spinner" style={{ width: 14, height: 14 }} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          )}
          {isLocating ? "Getting GPS fix…" : "Use my location"}
        </button>
      </div>

      <p className="site-location-picker__location-hint">
        Search an address, click the map, drag the pin, or use your GPS location.
      </p>

      {geoError && (
        <p className="site-location-picker__geo-error" role="alert">{geoError}</p>
      )}
    </div>
  );
}

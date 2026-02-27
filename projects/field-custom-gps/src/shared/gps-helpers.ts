import * as search from '../assets/icons/font-awesome/magnifying-glass.svg';
import * as mapMarker from '../assets/icons/font-awesome/map-marker-alt-solid.svg';
import * as locationPin from '../assets/icons/google-material/location-pin.svg';

export interface LatLngObject { lng: number, lat: number }

export const customGpsIcons = {
  mapMarker: mapMarker.default,
  search: search.default,
  locationPin: locationPin.default,
};

export function buildTemplate(template: string, styles: string): string {
  return `${template}<style>\n${styles}\n</style>`;
}

/**
 * Accepts stored JSON string and returns true if it looks like either
 * { lat, lng } or { latitude, longitude }.
 */
export function isLatLngObject(value: string) {
  if (!value)
    return false;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object')
      return false;
    const hasLatLng = typeof parsed.lat === 'number' && typeof parsed.lng === 'number';
    const hasLatitudeLongitude = typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number';
    return hasLatLng || hasLatitudeLongitude;
  } catch {
    return false;
  }
}

/**
 * Parse stored JSON and normalize to google.maps.LatLngLiteral ({lat,lng}) for map usage.
 * Accepts both {lat,lng} and {latitude,longitude}.
 */
export function parseLatLng(value: string): google.maps.LatLngLiteral {
  if (!value) throw new Error('Empty value');
  const parsed = JSON.parse(value);
  if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
    return { lat: parsed.lat, lng: parsed.lng };
  }
  if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
    return { lat: parsed.latitude, lng: parsed.longitude };
  }
  throw new Error('Invalid lat/lng object');
}

/**
 * Convert google.maps.LatLngLiteral to the internal 2sxc shape:
 * { "latitude": number, "longitude": number }
 *
 * This is what will be saved via connector.data.update(...) so the backend sees latitude/longitude.
 */
export function stringifyLatLng({ lat, lng }: google.maps.LatLngLiteral): string {
  return JSON.stringify({ latitude: lat, longitude: lng });
}
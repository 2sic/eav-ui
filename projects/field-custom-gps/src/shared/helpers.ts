import * as search from '../assets/icons/font-awesome/magnifying-glass.svg';
import * as mapMarker from '../assets/icons/font-awesome/map-marker-alt-solid.svg';
import * as locationPin from '../assets/icons/google-material/location-pin.svg';
import { CoordinatesDto } from '../preview/coordinates';

export interface LatLngObject { lng: number, lat: number }

export const customGpsIcons = {
  mapMarker: mapMarker.default,
  search: search.default,
  locationPin: locationPin.default,
};

// TODO: TRY to refactor to use the new context.app.getSetting(...) in the formulas-data
export function getDefaultCoordinates(connector: any): LatLngObject | null {
  const defaultCoordinates = connector?._experimental?.getSettings("Settings.GoogleMaps.DefaultCoordinates") as CoordinatesDto;
  return defaultCoordinates ? {
    lat: defaultCoordinates.Latitude,
    lng: defaultCoordinates.Longitude,
  } : null;
}

export function buildTemplate(template: string, styles: string): string {
  return `${template}<style>\n${styles}\n</style>`;
}

export function parseLatLng(value: string): google.maps.LatLngLiteral {
  if (value && value.trim().startsWith('{') && value.trim().endsWith('}')) {
    const latLng: google.maps.LatLngLiteral = JSON.parse(value);
    return latLng;
  } else {
    throw new Error('Invalid JSON string');
  }
}

export function isLatLngObject(value: string) {
  try {
    const parsed = JSON.parse(value);
    return (
      typeof parsed === 'object' &&
      typeof parsed.lat === 'number' &&
      typeof parsed.lng === 'number'
    );
  } catch {
    return false;
  }
}

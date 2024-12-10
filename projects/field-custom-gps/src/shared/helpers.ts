import * as mapMarker from '../assets/icons/font-awesome/map-marker-alt-solid.svg';

export const customGpsIcons = {
  mapMarker: mapMarker.default,
};

export function buildTemplate(template: string, styles: string): string {
  return `${template}<style>\n${styles}\n</style>`;
}

export function parseLatLng(value: string): google.maps.LatLngLiteral {
  if (value && value.trim().startsWith('{') && value.trim().endsWith('}')) {
    const latLng: google.maps.LatLngLiteral = JSON.parse(
      value.replace('latitude', 'lat').replace('longitude', 'lng')
    );
    return latLng;
  } else {
    throw new Error('Invalid JSON string');
  }
}

export function stringifyLatLng(latLng: google.maps.LatLngLiteral): string {
  const value = JSON.stringify(latLng).replace('lat', 'latitude').replace('lng', 'longitude');
  return value;
}

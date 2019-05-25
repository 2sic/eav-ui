export function buildTemplate(template: string, styles: string): string {
  return `${template}<style>\n${styles}\n</style>`;
}

export function parseLatLng(value: string): google.maps.LatLngLiteral {
  const latLng: google.maps.LatLngLiteral = JSON.parse(value.replace('latitude', 'lat').replace('longitude', 'lng'));
  return latLng;
}

export function stringifyLatLng(latLng: google.maps.LatLngLiteral): string {
  const value = JSON.stringify(latLng).replace('lat', 'latitude').replace('lng', 'longitude');
  return value;
}

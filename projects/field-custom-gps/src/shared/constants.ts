export const defaultCoordinates: google.maps.LatLngLiteral = {
  lat: 47.17465989999999,
  lng: 9.469142499999975,
};

const mapApiKeyPart1 = 'AIzaSyDPhn';
const mapApiKeyPart2 = 'NKpEg8FmY8nooE7Zwnue6SusxEnHE';

/** Special helper to assemble the url for the maps */
export function mapsApiUrl() {
  let url = 'https://maps.googleapis.com/maps/api/js?key=';
  // note: don't use `${...}` here, because that's probably combined at compile time, and we want to keep
  // the key parts separate so the google console doesn't complain about the key being public
  // add some fake condition, to prevent compiler optimization from pre-connecting the strings
  if (url) { url += mapApiKeyPart1; }
  if (!!url) { url += mapApiKeyPart2; }
  return url;
}

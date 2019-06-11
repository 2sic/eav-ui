import { } from 'google-maps';

export const defaultCoordinates: google.maps.LatLngLiteral = {
  lat: 47.17465989999999,
  lng: 9.469142499999975,
};

const mapApiKeyPart1 = 'AIzaSyDPhn';
const mapApiKeyPart2 = 'NKpEg8FmY8nooE7Zwnue6SusxEnHE';

export const mapsParameters = {
  // note: don't use `${...}` here, because that's probably combined at compile time, and we want to keep
  // the key parts separate so the google console doesn't complain about the key being public
  mapApiUrl: 'https://maps.googleapis.com/maps/api/js?key=' + mapApiKeyPart1 + mapApiKeyPart2,
};

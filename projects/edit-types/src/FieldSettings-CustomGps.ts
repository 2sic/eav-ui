/**
 * @custom-gps
 */
export interface CustomGps {
  LatField: string;
  LongField: string;
  AddressMask: string;
  _defaults: {
    lat: number;
    lng: number;
  } | null;
}

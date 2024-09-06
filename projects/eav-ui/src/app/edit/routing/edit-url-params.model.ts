/**
 * Url parameters from / for the route.
 * In most cases the parameters are strings, but in some cases they could be UrlSegment.
 */
export interface EditUrlParams<T = string> {
  zoneId?: T;
  appId?: T;
  items: T;
  detailsEntityGuid?: T;
  detailsFieldId?: T;
  updateEntityGuid?: T;
  updateFieldId?: T;
}

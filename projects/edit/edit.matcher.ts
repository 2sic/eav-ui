import { UrlSegment, UrlMatchResult } from '@angular/router';

import { EditPosParams } from './edit-matcher.models';

/**
 * ':zoneId/:appId/edit/:items'
 * ':zoneId/:appId/edit/:items/details/:detailsEntityGuid/:detailsFieldId'
 * ':zoneId/:appId/edit/:items/update/:updateEntityGuid/:updateFieldId'
 */
export function editRoot(url: UrlSegment[]): UrlMatchResult {
  if (url.length < 4) { return null; }
  if (url[2].path !== 'edit') { return null; }
  const hasDetails = url[4] != null && url[4].path === 'details' && url[5] != null && url[6] != null;
  const hasUpdate = url[4] != null && url[4].path === 'update' && url[5] != null && url[6] != null;
  const posParams: EditPosParams = {
    zoneId: url[0],
    appId: url[1],
    items: url[3],
    ...(hasDetails && { detailsEntityGuid: url[5], detailsFieldId: url[6] }),
    ...(hasUpdate && { updateEntityGuid: url[5], updateFieldId: url[6] }),
  };
  const match: UrlMatchResult = {
    consumed: url.slice(0, (hasDetails || hasUpdate) ? 7 : 4),
    posParams: posParams as any
  };
  return match;
}

/**
 * 'edit/:items'
 * 'edit/:items/details/:detailsEntityGuid/:detailsFieldId'
 * 'edit/:items/update/:updateEntityGuid/:updateFieldId'
 */
export function edit(url: UrlSegment[]): UrlMatchResult {
  if (url.length < 2) { return null; }
  if (url[0].path !== 'edit') { return null; }
  const hasDetails = url[2] != null && url[2].path === 'details' && url[3] != null && url[4] != null;
  const hasUpdate = url[2] != null && url[2].path === 'update' && url[3] != null && url[4] != null;
  const posParams: EditPosParams = {
    items: url[1],
    ...(hasDetails && { detailsEntityGuid: url[3], detailsFieldId: url[4] }),
    ...(hasUpdate && { updateEntityGuid: url[3], updateFieldId: url[4] }),
  };
  const match: UrlMatchResult = {
    consumed: url.slice(0, (hasDetails || hasUpdate) ? 5 : 2),
    posParams: posParams as any
  };
  return match;
}

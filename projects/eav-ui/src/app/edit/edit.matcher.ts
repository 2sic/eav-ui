import { UrlMatchResult, UrlSegment } from '@angular/router';
import { EditPosParams } from './edit-matcher.models';
import { EavLogger } from '../shared/logging/eav-logger';

const logThis = false;
const logger = new EavLogger('EditRouteMatchers', logThis);

/**
 * ':zoneId/:appId/edit/:items'
 * ':zoneId/:appId/edit/:items/details/:detailsEntityGuid/:detailsFieldId'
 * ':zoneId/:appId/edit/:items/update/:updateEntityGuid/:updateFieldId'
 */
export function editRouteMatcherRoot(url: UrlSegment[]): UrlMatchResult {
  const l = logger.fn('editRouteMatcherRoot', { url });
  if (url.length < 4) return l.rNull();
  if (url[2].path !== 'edit') return l.rNull();
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
    posParams: posParams as any,
  };
  return l.r(match, '✅');
}

/** ':zoneId/:appId/edit/refresh/:items' */
export function editRouteMatcherRootRefresh(url: UrlSegment[]): UrlMatchResult {
  const l = logger.fn('editRouteMatcherRootRefresh', { url });
  if (url.length < 5) return l.rNull();
  if (url[2].path !== 'edit' || url[3].path !== 'refresh') { return null; }
  const posParams: EditPosParams = {
    zoneId: url[0],
    appId: url[1],
    items: url[4],
  };
  const match: UrlMatchResult = {
    consumed: url.slice(0, 5),
    posParams: posParams as any,
  };
  return l.r(match, '✅');
}

/**
 * 'edit/:items'
 * 'edit/:items/details/:detailsEntityGuid/:detailsFieldId'
 * 'edit/:items/update/:updateEntityGuid/:updateFieldId'
 */
export function editRouteMatcherSubEdit(url: UrlSegment[]): UrlMatchResult {
  const l = logger.fn('editRouteMatcherSubEdit', { url });
  if (url.length < 2) return l.rNull();
  if (url[0].path !== 'edit') return l.rNull();
  const hasDetails = url[2] != null && url[2].path === 'details' && url[3] != null && url[4] != null;
  const hasUpdate = url[2] != null && url[2].path === 'update' && url[3] != null && url[4] != null;
  const posParams: EditPosParams = {
    items: url[1],
    ...(hasDetails && { detailsEntityGuid: url[3], detailsFieldId: url[4] }),
    ...(hasUpdate && { updateEntityGuid: url[3], updateFieldId: url[4] }),
  };
  const match: UrlMatchResult = {
    consumed: url.slice(0, (hasDetails || hasUpdate) ? 5 : 2),
    posParams: posParams as any,
  };
  return l.r(match, '✅');
}

/** 'edit/refresh/:items' */
export function editRouteMatcherSubEditRefresh(url: UrlSegment[]): UrlMatchResult {
  const l = logger.fn('editRouteMatcherSubEditRefresh', { url });
  if (url.length < 3) return l.rNull();
  if (url[0].path !== 'edit' || url[1].path !== 'refresh') return l.rNull();
  const posParams: EditPosParams = {
    items: url[2],
  };
  const match: UrlMatchResult = {
    consumed: url.slice(0, 3),
    posParams: posParams as any,
  };
  return l.r(match, '✅');
}

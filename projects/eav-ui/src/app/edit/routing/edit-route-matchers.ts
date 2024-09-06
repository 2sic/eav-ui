import { UrlMatchResult, UrlSegment } from '@angular/router';
import { EditUrlParams } from './edit-url-params.model';
import { EavLogger } from '../../shared/logging/eav-logger';

const logSpecs = {
  enabled: true,
  name: 'EditRouteMatchers',
  specs: {
    all: true,
    hasGuidAndId: false,
    editRouteMatcherRoot: false,
    editRouteMatcherRootRefresh: false,
    editRouteMatcherSubEdit: false,
    editRouteMatcherSubEditRefresh: false,
  },
};

const logger = new EavLogger(logSpecs);

/**
 * ':zoneId/:appId/edit/:items'
 * ':zoneId/:appId/edit/:items/details/:detailsEntityGuid/:detailsFieldId'
 * ':zoneId/:appId/edit/:items/update/:updateEntityGuid/:updateFieldId'
 */
export function editRouteMatcherRoot(url: UrlSegment[]): UrlMatchResult {
  const l = logger.fnIf('editRouteMatcherRoot', { url });
  const specs = checkRelevantAndIds(url, 2, 4);
  if (specs == null) return l.rNull();
  const posParams: EditUrlParams<UrlSegment> = {
    zoneId: url[0],
    appId: url[1],
    items: url[3],
    ...specs.identities,
  };
  const match: UrlMatchResult = {
    consumed: url.slice(0, specs.hasPurpose ? 7 : 4),
    posParams: posParams as any,
  };
  return l.r(match, '✅');
}

/**
 * Determine if we're in an edit route, and if we have details/update data.
 * If we have it, the returned spread is a bit different for each use case as the parameter names differ.
 */
function checkRelevantAndIds(url: UrlSegment[], posEdit: number, posPurpose: number) {
  const l = logger.fnIf('hasGuidAndId', { url, posPurpose });
  if (url.length < posPurpose) return l.rNull();
  if (url[posEdit].path !== 'edit') return l.rNull();
  const purpose = url[posPurpose]?.path;
  if (purpose == null) return l.r({ hasPurpose: false, identities: {} });
  const guid = url[posPurpose + 1];
  const id = url[posPurpose + 2];
  const hasGuidAndId = guid != null && id != null;
  const hasDetails = purpose === 'details' && hasGuidAndId;
  const hasUpdate = purpose === 'update' && hasGuidAndId;
  const identities = {
    ...(hasDetails && { detailsEntityGuid: guid, detailsFieldId: id }),
    ...(hasUpdate && { updateEntityGuid: guid, updateFieldId: id }),
  }
  return l.r({ hasPurpose: hasDetails || hasUpdate, identities });
}


/**
 * 'edit/:items'
 * 'edit/:items/details/:detailsEntityGuid/:detailsFieldId'
 * 'edit/:items/update/:updateEntityGuid/:updateFieldId'
 */
export function editRouteMatcherSubEdit(url: UrlSegment[]): UrlMatchResult {
  const l = logger.fnIf('editRouteMatcherSubEdit', { url });
  const specs = checkRelevantAndIds(url, 0, 2);
  if (specs == null) return l.rNull();
  const posParams: EditUrlParams<UrlSegment> = {
    items: url[1],
    ...specs.identities,
  };
  const match: UrlMatchResult = {
    consumed: url.slice(0, specs.hasPurpose ? 5 : 2),
    posParams: posParams as any,
  };
  return l.r(match, '✅');
}


/** 'edit/refresh/:items' */
export function editRouteMatcherSubEditRefresh(url: UrlSegment[]): UrlMatchResult {
  const l = logger.fnIf('editRouteMatcherSubEditRefresh', { url });
  if (url.length < 3) return l.rNull();
  if (url[0].path !== 'edit' || url[1].path !== 'refresh') return l.rNull();
  const posParams: EditUrlParams<UrlSegment> = {
    items: url[2],
  };
  const match: UrlMatchResult = {
    consumed: url.slice(0, 3),
    posParams: posParams as any,
  };
  return l.r(match, '✅');
}




/** ':zoneId/:appId/edit/refresh/:items' */
export function editRouteMatcherRootRefresh(url: UrlSegment[]): UrlMatchResult {
  const l = logger.fnIf('editRouteMatcherRootRefresh', { url });
  if (url.length < 5) return l.rNull();
  if (url[2].path !== 'edit' || url[3].path !== 'refresh') { return null; }
  const posParams: EditUrlParams<UrlSegment> = {
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
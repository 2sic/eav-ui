import { UrlSegment, UrlMatchResult } from '@angular/router';

/** ':zoneId/:appId/edit/:items' or ':zoneId/:appId/edit/:items/details/:expandedFieldId' */
export function editRoot(url: UrlSegment[]): UrlMatchResult {
  if (url.length < 4) { return null; }
  if (url[2].path !== 'edit') { return null; }
  const hasExpandedFieldId = !!url[4] && url[4].path === 'details' && !!url[5];
  const match: UrlMatchResult = {
    consumed: url.slice(0, hasExpandedFieldId ? 6 : 4),
    posParams: {
      zoneId: url[0],
      appId: url[1],
      items: url[3],
      ...(hasExpandedFieldId && { expandedFieldId: url[5] }),
    }
  };
  return match;
}

/** 'edit/:items' or 'edit/:items/details/:expandedFieldId' */
export function edit(url: UrlSegment[]): UrlMatchResult {
  if (url.length < 2) { return null; }
  if (url[0].path !== 'edit') { return null; }
  const hasExpandedFieldId = !!url[2] && url[2].path === 'details' && !!url[3];
  const match: UrlMatchResult = {
    consumed: url.slice(0, hasExpandedFieldId ? 4 : 2),
    posParams: {
      items: url[1],
      ...(hasExpandedFieldId && { expandedFieldId: url[3] }),
    }
  };
  return match;
}

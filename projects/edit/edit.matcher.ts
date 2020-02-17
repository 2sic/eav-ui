import { UrlSegment, UrlMatchResult } from '@angular/router';

/** ':zoneId/:appId/edit/:items' or ':zoneId/:appId/edit/:items/:expandedFieldId' */
export function editRoot(url: UrlSegment[]): UrlMatchResult {
  if (url.length < 4) { return null; }
  if (url[2].path !== 'edit') { return null; }
  const hasExpandedFieldId = !!url[4] && isNumeric(url[4].path);
  const match: UrlMatchResult = {
    consumed: url.slice(0, hasExpandedFieldId ? 5 : 4),
    posParams: {
      zoneId: url[0],
      appId: url[1],
      items: url[3],
      ...(hasExpandedFieldId && { expandedFieldId: url[4] }),
    }
  };
  return match;
}

/** 'edit/:items' or 'edit/:items'/:expandedFieldId' */
export function edit(url: UrlSegment[]): UrlMatchResult {
  if (url.length < 2) { return null; }
  if (url[0].path !== 'edit') { return null; }
  const hasExpandedFieldId = !!url[2] && isNumeric(url[2].path);
  const match: UrlMatchResult = {
    consumed: url.slice(0, hasExpandedFieldId ? 3 : 2),
    posParams: {
      items: url[1],
      ...(hasExpandedFieldId && { expandedFieldId: url[2] }),
    }
  };
  return match;
}

function isNumeric(value: string) {
  return /^-{0,1}\d+$/.test(value);
}

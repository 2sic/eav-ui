import { UrlSegment } from '@angular/router';

export interface EditPosParams {
  zoneId?: UrlSegment;
  appId?: UrlSegment;
  items: UrlSegment;
  detailsEntityGuid?: UrlSegment;
  detailsFieldId?: UrlSegment;
  updateEntityGuid?: UrlSegment;
  updateFieldId?: UrlSegment;
}

export interface EditParams {
  zoneId?: string;
  appId?: string;
  items: string;
  detailsEntityGuid?: string;
  detailsFieldId?: string;
  updateEntityGuid?: string;
  updateFieldId?: string;
}

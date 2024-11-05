import { ContentItem } from "projects/eav-ui/src/app/content-items/models/content-item.model";

export type DataBundlesType = 'delete';
export interface DataBundlesDetailActionsParams {
  do(verb: DataBundlesType, item: ContentItem): void;
}


import { ContentItem } from "projects/eav-ui/src/app/content-items/models/content-item.model";

export type DataBundlesType = 'edit' | 'download' | 'saveState' | 'restoreState';
export interface DataBundlesActionsParams {
  do(verb: DataBundlesType, item: ContentItem): void;
}


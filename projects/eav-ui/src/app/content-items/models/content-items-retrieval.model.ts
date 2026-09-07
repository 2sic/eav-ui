export type ContentItemsLimit = 0 | 10 | 100 | 1000;
export type ContentItemsColumns = 'all' | 'basics';

export interface ContentItemsRetrieval {
  /** Zero means all items. */
  top: ContentItemsLimit;
  columns: ContentItemsColumns;
}

// Include the administrative fields required by status, permissions and row actions.
export const contentItemsBasicFields = 'Id,Guid,IsPublished,Title,_Title,_RepositoryId,_EditInfo,For,Metadata';

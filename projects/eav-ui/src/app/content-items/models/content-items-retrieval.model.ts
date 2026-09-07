export type ContentItemsRange =
  | 'all'
  | 'first10'
  | 'first100'
  | 'first1000'
  | 'last10'
  | 'last100'
  | 'last1000';
export type ContentItemsColumns = 'all' | string[];

export interface ContentItemsRetrieval {
  range: ContentItemsRange;
  columns: ContentItemsColumns;
}

export const contentItemsBasicFields = [
  'Id',
  'Guid',
  'IsPublished',
  'Title',
  '_Title',
  '_RepositoryId',
  '_EditInfo',
  'For',
  'Metadata',
];

export interface ContentItemsRangeOption {
  label: string;
  value: ContentItemsRange;
  top?: 10 | 100 | 1000;
  orderBy?: 'EntityId asc' | 'EntityId desc';
}

export const contentItemsRangeOptions: ContentItemsRangeOption[] = [
  { label: 'All', value: 'all' },
  { label: 'First 10', value: 'first10', top: 10, orderBy: 'EntityId asc' },
  { label: 'First 100', value: 'first100', top: 100, orderBy: 'EntityId asc' },
  { label: 'First 1000', value: 'first1000', top: 1000, orderBy: 'EntityId asc' },
  { label: 'Last 10', value: 'last10', top: 10, orderBy: 'EntityId desc' },
  { label: 'Last 100', value: 'last100', top: 100, orderBy: 'EntityId desc' },
  { label: 'Last 1000', value: 'last1000', top: 1000, orderBy: 'EntityId desc' },
];

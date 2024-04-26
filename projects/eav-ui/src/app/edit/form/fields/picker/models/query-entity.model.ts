import { EntityForPicker } from 'projects/edit-types';

export interface QueryEntity extends EntityForPicker {
  Guid: string;
  // 2024-04-26 2dm removed this, don't think it's used and believe it's a leftover #cleanup-picker
  // Modified: string;
  [key: string]: any;
}

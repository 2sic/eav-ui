import { AdamItem } from '../../../../../../edit-types';

export interface AdamSnapshot {
  Guid: string;
  Attributes: AdamSnapshotAttributes;
}

export interface AdamSnapshotAttributes {
  [name: string]: AdamItem[];
}

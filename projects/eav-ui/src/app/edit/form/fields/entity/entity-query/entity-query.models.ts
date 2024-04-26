import { EntityForPicker } from 'projects/edit-types';

export interface QueryStreams {
  [stream: string]: QueryEntity[];
}

export interface QueryEntity extends EntityForPicker {
  Guid: string;
  Modified: string;
  [key: string]: any;
}

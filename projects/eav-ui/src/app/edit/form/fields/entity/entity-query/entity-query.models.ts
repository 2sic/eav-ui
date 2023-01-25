import { EntityForPicker } from 'projects/edit-types';

export interface QueryStreams {
  [stream: string]: QueryEntity[];
}

export interface QueryEntity extends EntityForPicker {
  // /** New in v15, sometimes included to indicate if it's from the current app */
  // AppId: number;
  Guid: string;
  Id: number;
  Modified: string;
  Title: string;
  [key: string]: any;
  _2sxcEditInformation: QuerySxcEditInformation;

  // /** Prevent edit of this item for whatever reason, v15 */
  // _disableEdit?: boolean;

}

export interface QuerySxcEditInformation {
  entityId: number;
  isPublished: boolean;
  title: string;
}

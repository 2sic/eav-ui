import { EntityForPicker } from 'projects/edit-types';

export interface QueryStreams {
  [stream: string]: QueryEntity[];
}

export interface QueryEntity extends EntityForPicker {
  Guid: string;
  Modified: string;
  [key: string]: any;

  // 2023-01-26 2dm doesn't seem to be in use, commented out
  // Remove in Feb when confirmed not used
  // _2sxcEditInformation: QuerySxcEditInformation;

  // 2023-01-26 2dm moved to EntityForPicker (parent)
  // remove this end of Feb when confirmed not used
  // Id: number;
  // Title: string;
}

// 2023-01-26 2dm doesn't seem to be in use, commented out
// Remove in Feb when confirmed not used
// export interface QuerySxcEditInformation {
//   entityId: number;
//   isPublished: boolean;
//   title: string;
// }

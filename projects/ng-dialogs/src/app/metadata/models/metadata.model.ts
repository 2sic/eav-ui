import { EavType } from '../../../../../edit/shared/models/eav';

export interface MetadataItem {
  Created: string;
  Guid: string;
  Id: number;
  Modified: string;
  Title: string;
  _Type: EavType;
  [key: string]: any;
}

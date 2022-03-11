import { EavFor } from '../../../../../edit/shared/models/eav';
import { MetadataItemShort } from '../../metadata';
import { EditInfo } from '../../shared/models/edit-info';

export interface ContentItem {
  Id: number;
  Guid: string;
  _RepositoryId: number;
  IsPublished: boolean;
  _Title: string;
  Title: string;
  For?: EavFor;
  Metadata?: MetadataItemShort[];

  /** How often this is being used by other entities (parents) */
  _Used: number;

  /** How often this entity uses other entities (children) */
  _Uses: number;

  /** Additional information if this item can/may be edited */
  _EditInfo: EditInfo;

  // fields added by the user
  [key: string]: any;
}

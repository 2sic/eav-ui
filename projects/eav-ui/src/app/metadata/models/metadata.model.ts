import { EavFor, EavForInAdminUi, EavType } from '../../edit/shared/models/eav';

/**
 * MetadataDto - information as provided by the server
 */
export interface MetadataDto {
  /**
   * 2024-02-20 2dm - the target address of the current item, for creating new metadata _for_ this item.
   * IMHO not in use ATM.
   */
  For: EavFor;
  Items: MetadataItem[];
  Recommendations: MetadataRecommendation[];
}

export interface MetadataItem {
  Created: string;
  Guid: string;
  Id: number;
  Modified: string;
  Title: string;
  _Type: EavType;
  [key: string]: any;
}

export interface MetadataRecommendation {
  Count: number;
  CreateEmpty?: boolean;
  Debug: string;
  DeleteWarning: '' | string;
  Icon: '' | string;
  Id: string;
  Name: string;
  Title: string;
  Enabled: boolean;
  MissingFeature?: string;
}

export interface MetadataViewModel {
  metadata: MetadataItem[];
  recommendations: MetadataRecommendation[];
  itemFor?: EavForInAdminUi;
  fabOpen: boolean;
}

export interface MetadataItemShort {
  Guid: string;
  Id: number;
  Title: string;
}

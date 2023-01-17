import { EavFor, EavType } from '../../edit/shared/models/eav';

export interface Metadata {
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

export interface MetadataTemplateVars {
  metadata: MetadataItem[];
  recommendations: MetadataRecommendation[];
  itemFor?: EavFor;
  fabOpen: boolean;
}

export interface MetadataItemShort {
  Guid: string;
  Id: number;
  Title: string;
}

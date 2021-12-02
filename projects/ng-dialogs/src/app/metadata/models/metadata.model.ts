import { EavType } from '../../../../../edit/shared/models/eav';
import { ContentItemFor } from '../../content-items/models/content-item.model';

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
  Debug: string;
  Id: string;
  Name: string;
}

export interface MetadataTemplateVars {
  metadata: MetadataItem[];
  recommendations: MetadataRecommendation[];
  itemFor?: ContentItemFor;
  fabOpen: boolean;
}

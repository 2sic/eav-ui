import { EavType } from '../../../../../edit/shared/models/eav';

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

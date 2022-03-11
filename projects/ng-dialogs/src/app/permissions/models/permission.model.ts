import { MetadataItem } from '../../metadata';

export interface Permission extends MetadataItem {
  Identity: string;
  Condition: string;
  Grant: string;
}

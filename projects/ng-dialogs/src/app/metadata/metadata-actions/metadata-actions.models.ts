import { MetadataItem } from '../models/metadata.model';

export interface MetadataActionsParams {
  onDelete(metadata: MetadataItem): void;
}

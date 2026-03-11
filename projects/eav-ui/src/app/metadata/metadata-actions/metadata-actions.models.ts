import { MetadataItem } from "../models/metadata.model";

export type MetadataActionsVerb = 'delete';

export interface MetadataActionsParams {
  do(verb: MetadataActionsVerb, metadata: MetadataItem): void;
}
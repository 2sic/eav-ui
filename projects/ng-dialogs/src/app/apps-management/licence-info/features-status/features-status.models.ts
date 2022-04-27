import { Feature } from '../../models/feature.model';

export interface FeaturesStatusParams {
  isDisabled(): boolean;
  onToggle(feature: Feature, enabled: boolean): void;
}

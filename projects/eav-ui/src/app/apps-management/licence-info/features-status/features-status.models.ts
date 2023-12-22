import { Feature } from '../../../features/models/feature.model';

export interface FeaturesStatusParams {
  isDisabled(feature: Feature): boolean;
  onToggle(feature: Feature, enabled: boolean): void;
}

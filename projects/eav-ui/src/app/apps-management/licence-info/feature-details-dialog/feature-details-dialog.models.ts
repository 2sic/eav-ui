import { Feature } from '../../../features/models/feature.model';

export interface FeatureDetailsDialogData {
  feature: Feature;
  showGuid: boolean;
  showStatus: boolean;
  showClose?: boolean;
}

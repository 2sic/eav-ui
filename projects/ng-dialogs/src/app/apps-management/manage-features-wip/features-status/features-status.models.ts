import { ICellRendererParams } from '@ag-grid-community/core';
import { Feature } from '../../models/feature.model';

export interface FeaturesStatusParams extends ICellRendererParams {
  onEnabledToggle(feature: Feature, enabled: boolean): void;
}

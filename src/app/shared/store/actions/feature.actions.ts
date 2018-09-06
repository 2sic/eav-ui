import { Action } from '@ngrx/store';
import { Feature } from '../../models/feature/feature';

export const LOAD_FEATURES = '[Feature] LOAD_FEATURES';

export class LoadFeaturesAction implements Action {
    readonly type = LOAD_FEATURES;

    constructor(public newFeatures: Feature[]) { }
}

export type Actions
    = LoadFeaturesAction;

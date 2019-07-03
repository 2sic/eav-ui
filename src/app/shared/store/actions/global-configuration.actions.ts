import { Action } from '@ngrx/store';

export const LOAD_DEBUG_ENABLED = '[GlobalConfiguration] LOAD_DEBUG_ENABLED';

export class LoadDebugEnabledAction implements Action {
    readonly type = LOAD_DEBUG_ENABLED;

    constructor(public debugEnabled: boolean) { }
}

export type Actions
    = LoadDebugEnabledAction;

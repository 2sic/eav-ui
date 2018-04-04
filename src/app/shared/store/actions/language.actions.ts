import { Action } from '@ngrx/store';
import { Language } from '../../models/eav';

export const LOAD_LANGUAGES = '[Language] LOAD_LANGUAGES';
export const UPDATE_CURRENT_LANGUAGE = '[Language] UPDATE_CURRENT_LANGUAGE';
export const UPDATE_DEFAULT_LANGUAGE = '[Language] UPDATE_DEFAULT_LANGUAGE';

export class LoadLanguagesAction implements Action {
    readonly type = LOAD_LANGUAGES;

    constructor(public newLanguage: Language[], public currentLanguage: string, public defaultLanguage: string) { }
}

export class UpdateCurrentLanguageAction implements Action {
    readonly type = UPDATE_CURRENT_LANGUAGE;

    constructor(public currentLanguage: string) { }
}

export class UpdateDefaultLanguageAction implements Action {
    readonly type = UPDATE_DEFAULT_LANGUAGE;

    constructor(public defaultLanguage: string) { }
}

export type Actions
    = LoadLanguagesAction
    | UpdateCurrentLanguageAction
    | UpdateDefaultLanguageAction;

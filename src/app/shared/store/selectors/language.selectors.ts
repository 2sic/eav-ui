import { createSelector } from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromLanguage from '../reducers/language.reducer';

export const getLanguageState = createSelector(
    fromFeature.getEavState,
    (state: fromFeature.EavState) => state.languages
);

export const getLanguages = createSelector(getLanguageState, fromLanguage.getLanguages);
export const getCurrentLanguage = createSelector(getLanguageState, fromLanguage.getCurrentLanguage);
export const getDefaultLanguage = createSelector(getLanguageState, fromLanguage.getDefaultLanguage);
export const getUILanguage = createSelector(getLanguageState, fromLanguage.getUILanguage);

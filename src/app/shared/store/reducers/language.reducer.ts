import { Item } from '../../models/eav/item';
import * as fromLanguages from './../actions/language.actions';
import { AppState } from '../../models/app-state';
import { Language } from '../../models/eav/language';


export interface LanguagesState {
    languages: Language[];
    currentLanguage: string;
    defaultLanguage: string;
}

export const initialState: LanguagesState = {
    languages: [],
    currentLanguage: 'en-us',
    defaultLanguage: 'en-us'
};

export function languageReducer(state = initialState, action: fromLanguages.Actions): LanguagesState {
    switch (action.type) {
        case fromLanguages.LOAD_LANGUAGES: {
            // console.log('loadsuccess item: ', action.newItem);
            return {
                ...state,
                ...{
                    languages: [...action.newLanguage],
                    currentLanguage: action.currentLanguage,
                    defaultLanguage: action.defaultLanguage,
                }
            };
        }
        case fromLanguages.UPDATE_CURRENT_LANGUAGE: {
            console.log('action.attributes', action.currentLanguage);
            return {
                ...state,
                ...{
                    currentLanguage: action.currentLanguage
                }
            };
        }
        case fromLanguages.UPDATE_DEFAULT_LANGUAGE: {
            console.log('action.attributes', action.defaultLanguage);
            return {
                ...state,
                ...{
                    defaultLanguage: action.defaultLanguage
                }
            };
        }
        // case fromItems.DELETE_ITEM:
        //     return {
        //         ...state,
        //         ...{
        //             items: state.items.filter(item => item.entity.id !== action.item.entity.id)
        //         }
        //     };
        default: {
            return state;
        }
    }
}

export const getLanguages = (state: LanguagesState) => state.languages;
export const getCurrentLanguage = (state: LanguagesState) => state.currentLanguage;
export const getDefaultLanguage = (state: LanguagesState) => state.defaultLanguage;

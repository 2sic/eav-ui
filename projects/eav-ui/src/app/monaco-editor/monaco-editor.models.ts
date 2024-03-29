export interface JsonSchema {
  type: 'link' | 'raw';
  value: string;
}

export interface Monaco2sxc {
  themesAreDefined: boolean;
  savedStates: Monaco2sxcSavedStates;
}

export interface Monaco2sxcSavedStates {
  [uri: string]: Monaco2sxcSavedState;
}

export interface Monaco2sxcSavedState {
  viewState: string;
}

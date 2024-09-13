import { Signal } from '@angular/core';
import { FieldSettings, FieldValue } from 'projects/edit-types';

/**
 * Small helper class to do mapping between the state and the UI.
 * 
 * Basically the reason is that the UI sometimes needs a slightly different representation of the state.
 * 
 * This class should help map both ways.
 */
export abstract class StateUiMapperBase<TState extends FieldValue = FieldValue, TUi extends FieldValue = FieldValue> {
  
  constructor(protected fieldName?: string) { }

  abstract toUi(state: TState): TUi;

  abstract toState(uiValue: TUi): TState;
}


export abstract class StateUiMapperWithSettingsBase<TState extends FieldValue = FieldValue, TUi extends FieldValue = FieldValue>
  extends StateUiMapperBase<TState, TUi> {
  constructor(fieldName: string, protected settings: Signal<FieldSettings>) {
    super(fieldName);
  }

  abstract toUi(state: TState): TUi;

  abstract toState(uiValue: TUi): TState;
}
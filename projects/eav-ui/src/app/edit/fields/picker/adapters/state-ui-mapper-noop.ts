import { StateUiMapperBase } from './state-ui-mapper-base';

/**
 * A noop mapper that does nothing, as the data-type for state is the same as the UI.
 * 
 * Typically used in Entity-Picker fields.
 */
export class StateUiMapperNoop extends StateUiMapperBase<any, any> {
  toUi(state: any): any {
    return state;
  }

  toState(uiValue: any): any {
    return uiValue;
  }
}
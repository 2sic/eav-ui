import { EavCustomInputField } from '../../../shared/eav-custom-input-field';
// tslint:disable-next-line:max-line-length
import { HiddenProps } from '../../../../src/app/eav-material-controls/input-types/custom/external-webcomponent-properties/external-webcomponent-properties';

export class EavExperimentalInputField<T> extends EavCustomInputField<T> {
  hiddenProps: HiddenProps;
}

export class MyEventListenerModel {
  element: HTMLElement;
  type: string;
  listener: EventListenerOrEventListenerObject;
}

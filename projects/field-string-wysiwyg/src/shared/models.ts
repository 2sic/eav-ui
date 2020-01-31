import { EavCustomInputField, EavCustomInputFieldObservable } from '../../../shared/eav-custom-input-field';
// tslint:disable-next-line:max-line-length
import { ExperimentalProps } from '../../../edit/eav-material-controls/input-types/custom/external-web-component/connector/models/custom-element-properties.model';

export class EavExperimentalInputField<T> extends EavCustomInputField<T> {
  experimental: ExperimentalProps;
}

export class EavExperimentalInputFieldObservable<T> extends EavCustomInputFieldObservable<T> {
  experimental: ExperimentalProps;
}

import { EavCustomInputField, EavCustomInputFieldObservable, Connector, ConnectorObservable } from '../../../edit-types';
// tslint:disable-next-line:max-line-length
import { ExperimentalProps } from '../../../edit/eav-material-controls/input-types/custom/external-web-component/connector/models/custom-element-properties.model';

export class EavExperimentalInputField<T> extends HTMLElement implements EavCustomInputField<T> {
  connector: Connector<T>;
  experimental: ExperimentalProps;
}

export class EavExperimentalInputFieldObservable<T> extends HTMLElement implements EavCustomInputFieldObservable<T> {
  connector: ConnectorObservable<T>;
  experimental: ExperimentalProps;
}

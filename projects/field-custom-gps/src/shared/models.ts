import { EavCustomInputField } from '../../../shared/eav-custom-input-field';
// tslint:disable-next-line:max-line-length
import { ExperimentalProps } from '../../../../src/app/eav-material-controls/input-types/custom/external-webcomponent-properties/external-webcomponent-properties';

export class EavExperimentalInputField<T> extends EavCustomInputField<T> {
  experimental: ExperimentalProps;
}

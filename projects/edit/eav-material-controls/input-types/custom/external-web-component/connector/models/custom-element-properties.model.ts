import { Connector } from '../../../../../../../edit-types';

export class CustomElementProperties<T> {
  connector: Connector<T>;
  host: any;
  adamSetValueCallback: any;
  adamAfterUploadCallback: any;
}

/** Props and methods available to the connector to communicate with the host */

export interface ConnectorHost<T = any> {
  update: (value: T) => void;
  expand: (expand: boolean, componentTag?: string) => void;
}

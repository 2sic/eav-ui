import { Observable } from 'rxjs';

export interface ConnectorData<T> {

  /** Current value of the field */
  value: T;

  /**
   * Client updates value in the host
   * @param newValue - New value of the field from the client
   */
  update(newValue: T): void;

  /**
   * Client adds callback functions to be executed every time value changes in the host.
   * So call it to register your function which should run on change.
   *
   * Use this if you are not familier with observables.
   * @param callback - Function to be executed every time value changes in the host
   */
  onValueChange(callback: (newValue: T) => void): void;

  /**
   * Observable on field value
   * Use this if you are familiar with observables.
   */
  value$: Observable<T>;

  /**
   * Fired before form is saved.
   * It tells your control that the form is about to save, and that this is the last moment you can update the value.
   * Used in case your input doesn't always push changed values, like in WYSIWYG and other complex input fields which may buffer changes.
   */
  forceConnectorSave$: Observable<T>;
}

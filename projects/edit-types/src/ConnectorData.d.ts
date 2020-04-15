export interface ConnectorData<T> {

  /** Current value of the field */
  value: T;

  /**
   * Client updates value in the host
   * @param newValue - New value of the field from the client
   */
  update: (newValue: T) => void;

  /**
   * Client adds callback functions to be executed every time value changes in the host
   * @param callback - Function to be executed every time value changes in the host
   */
  onValueChange: (callback: (newValue: T) => void) => void;
}

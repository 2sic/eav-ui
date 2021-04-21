/**
 * Responsible for opening/closing dialogs in a control.
 */
export interface ConnectorDialog {
  /**
   * Opens a dialog and shows a WebComponent inside it.
   *
   * @param {string} [componentTag] name of the WebComponent which will be loaded inside the dialog
   */
  open(componentTag?: string): void;
  /**
   * Closes the dialog
   */
  close(): void;
}

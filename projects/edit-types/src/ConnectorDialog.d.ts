export interface ConnectorDialog<T> {

  /** Opens the dialog */
  open(componentTag?: string): void;

  /** Closes the dialog */
  close(): void;
}

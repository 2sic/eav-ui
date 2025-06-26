export interface ClosingDialogState<T> {
    dialogValue: T;
  }
  
  export interface DialogRoutingState {
    returnValue?: boolean;
    overrideContents?: Record<string, unknown>[];
  }
  
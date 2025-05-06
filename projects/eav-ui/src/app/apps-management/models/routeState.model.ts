export interface ClosingDialogState<T> {
    dialogValue: T;
  }
  
  export interface DialogRoutingState<T = unknown> {
    returnValue?: boolean;
    data?: T;
  }
  
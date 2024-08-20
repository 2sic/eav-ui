
export interface SaveErrorsSnackBarData {
  fieldErrors: FieldErrorMessage[];
}

export interface FieldErrorMessage {
  field: string;
  message: string;
}

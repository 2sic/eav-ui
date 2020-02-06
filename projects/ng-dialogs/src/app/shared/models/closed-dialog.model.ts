/** Name of the closed dialog and data returned upon closing */
export class ClosedDialog {
  dialogName: string;
  data: ClosedDialogData;
}

/** Data returned in dialogClose() */
export class ClosedDialogData {
  result: any;
  toNotify: ClosedDialogNotify;
}

/** Tells which field in edit-ui opened child edit-ui to filter update when child closes */
export class ClosedDialogNotify {
  entityId: number;
  fieldName: string;
}

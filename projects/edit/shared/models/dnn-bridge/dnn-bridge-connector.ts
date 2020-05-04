export class DnnBridgeConnector {
  constructor(
    public params: any,
    public valueChanged: any,
    public dialogType: string,
  ) {
    this.params = params;
    this.valueChanged = valueChanged;
    this.dialogType = dialogType;
  }
}

export class DnnBridgeDialogData {
  constructor(
    public type: string,
    public connector: DnnBridgeConnector,
  ) {
    this.type = type;
    this.connector = connector;
  }
}

export class PagePickerResult {
  constructor(
    public id: string,
    public name: string,
  ) { }
}

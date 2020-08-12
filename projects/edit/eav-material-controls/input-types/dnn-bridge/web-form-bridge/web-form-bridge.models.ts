export interface DnnBridgeConnector {
  params: any;
  valueChanged: any;
  dialogType: string;
}

export interface DnnBridgeDialogData {
  type: string;
  connector: DnnBridgeConnector;
}

export interface PagePickerResult {
  id: string;
  name: string;
}

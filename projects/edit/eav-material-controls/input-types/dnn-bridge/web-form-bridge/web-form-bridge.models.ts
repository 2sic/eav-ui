export interface DnnBridgeDialogData {
  connector: DnnBridgeConnector;
}

export interface DnnBridgeConnector {
  params: DnnBridgeConnectorParams;
  valueChanged: (value: any) => void;
  dialogType: string;
}

export interface DnnBridgeConnectorParams {
  CurrentValue: string;
  FileFilter: string;
  Paths: string;
}

export interface PagePickerResult {
  id: string;
  name: string;
}

import { DnnBridgeConnectorParams } from '../../../../edit-types';

export interface DnnBridgeDialogData {
  connector: DnnBridgeConnector;
}

export interface DnnBridgeConnector {
  params: DnnBridgeConnectorParams;
  valueChanged: (value: any) => void;
  dialogType: DnnBridgeType;
}

export type DnnBridgeType = 'pagepicker';

export interface PagePickerResult {
  id: string;
  name: string;
}

export type DnnBridgeIframe = (typeof window | HTMLIFrameElement) & {
  connectBridge(connector: DnnBridgeConnector): void;
};

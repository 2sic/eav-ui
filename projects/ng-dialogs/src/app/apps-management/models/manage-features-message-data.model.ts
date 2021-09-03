export interface ManageFeaturesMessageData {
  key: string;
  msg: ManageFeaturesMessageDataMsg;
}

export interface ManageFeaturesMessageDataMsg {
  features: string;
  signature: any;
}

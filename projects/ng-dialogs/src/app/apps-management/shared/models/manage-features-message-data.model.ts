export class ManageFeaturesMessageData {
  key: string;
  msg: ManageFeaturesMessageDataMsg;
}

export class ManageFeaturesMessageDataMsg {
  features: string;
  signature: any; // spm TODO: find out the type and whether it is used at all
}


export type PlumbUntypedAny = any;


export interface TypeInfos {
  [guid: string]: TypeInfo;
}

export interface TypeInfo {
  EnableConfig?: boolean;
  DynamicIn: boolean;
  DynamicOut: boolean;
  HelpLink?: string;
  Icon: string;
  Name: string;
  UiHint: string;

  outMode: string;
}

export interface GuiTypes {
  [key: string]: GuiType;
}

export interface GuiType {
  Icon: string;
  Label?: string;
  Name: string;
  UiHint: string;
}

export interface EndpointInfo {
  name: string;
  required: boolean;
}

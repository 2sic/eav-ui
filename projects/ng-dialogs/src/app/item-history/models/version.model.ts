export interface Version {
  Attributes: VerAttribute[];
  ChangeSetId: number;
  HistoryId: number;
  TimeStamp: string;
  User: string;
  VersionNumber: number;
  _isLastVersion: boolean;
}

export interface VerAttribute {
  attributeName: string;
  dataType: string;
  expand: boolean;
  hasChanged: boolean;
  attributeValues: VerAttributeValue[];
}

export interface VerAttributeValue {
  langKey: string;
  value: any;
  hasChanged: boolean;
}

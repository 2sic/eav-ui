export interface HistoryItem {
  Attributes: HistoryAttribute[];
  ChangeSetId: number;
  HistoryId: number;
  TimeStamp: string;
  User: string;
  VersionNumber: number;
  _isLastVersion: boolean;
}

export interface HistoryAttribute {
  attributeName: string;
  dataType: string;
  expand: boolean;
  hasChanged: boolean;
  attributeValues: HistoryAttributeValue[];
}

export interface HistoryAttributeValue {
  langKey: string;
  value: any;
  hasChanged: boolean;
}

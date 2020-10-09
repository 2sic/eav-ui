export interface HistoryItem {
  attributes: HistoryAttribute[];
  changeSetId: number;
  historyId: number;
  timeStamp: string;
  user: string;
  versionNumber: number;
  isLastVersion: boolean;
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

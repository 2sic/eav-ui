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
  name: string;
  dataType: string;
  change: 'new' | 'deleted' | 'changed' | 'none';
  values: HistoryAttributeValue[];
}

export interface HistoryAttributeValue {
  langKey: string;
  value: any;
  oldValue: any;
  change: 'new' | 'deleted' | 'changed' | 'none';
}

export interface RawVersion {
  ChangeSetId: number;
  HistoryId: number;
  Json: string;
  TimeStamp: string;
  User: string;
  VersionNumber: number;
}

export interface RawVerJsonParsed {
  Entity: RawVerEntity;
  _: RawVerUnderscore;
}

export interface RawVerEntity {
  Attributes: RawVerEntityDataTypes;
  Guid: string;
  Id: number;
  Type: RawVerEntityType;
  Version: number;
}

export interface RawVerEntityDataTypes {
  [dataType: string]: RawVerEntityAttributes;
}

export interface RawVerEntityAttributes {
  [attributeName: string]: RawVerEntityAttributeValues;
}

export interface RawVerEntityAttributeValues {
  [langKey: string]: any;
}

export interface RawVerEntityType {
  Name: string;
  Id: string;
}

export interface RawVerUnderscore {
  V: number;
}

export interface Version {
  ChangeSetId: number;
  HistoryId: number;
  Json: string;
  TimeStamp: string;
  User: string;
  VersionNumber: number;
}

export interface VersionJsonParsed {
  Entity: VersionEntity;
  _: VersionUnderscore;
}

export interface VersionEntity {
  Attributes: VersionEntityDataTypes;
  Guid: string;
  Id: number;
  Type: VersionEntityType;
  Version: number;
}

export interface VersionEntityDataTypes {
  [dataType: string]: VersionEntityAttributes;
}

export interface VersionEntityAttributes {
  [attributeName: string]: VersionEntityAttributeValues;
}

export interface VersionEntityAttributeValues {
  [langKey: string]: any;
}

export interface VersionEntityType {
  Name: string;
  Id: string;
}

export interface VersionUnderscore {
  V: number;
}

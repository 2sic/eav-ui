export interface ViewUsageData {
  Block: ViewUsageDataBlock;
  Module?: ViewUsageDataModule;
  PageId?: number;
  Name?: string;
  Url?: string;
  Language?: string;
  Status?: ViewUsageDataStatus;
}

export interface ViewUsageDataBlock {
  Id: number;
  Guid: string;
}

export interface ViewUsageDataModule {
  Id: number;
  /** This is the same as the TabModuleId in DNN. Basically if a module is used many times, this is the use-again-id */
  UsageId: number;
  Title: string;
}

export interface ViewUsageDataStatus {
  IsVisible: boolean;
  IsDeleted: boolean;
}

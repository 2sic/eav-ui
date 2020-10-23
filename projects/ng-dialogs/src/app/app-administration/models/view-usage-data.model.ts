export class ViewUsageData {
  Block: ViewUsageDataBlock;
  Module?: ViewUsageDataModule;
  PageId?: number;
  Name?: string;
  Url?: string;
  Language?: string;
  Status?: ViewUsageDataStatus;
}

export class ViewUsageDataBlock {
  Id: number;
  Guid: string;
}

export class ViewUsageDataModule {
  Id: number;
  /** This is the same as the TabModuleId in DNN. Basically if a module is used many times, this is the use-again-id */
  UsageId: number;
  Title: string;
}

export class ViewUsageDataStatus {
  IsVisible: boolean;
  IsDeleted: boolean;
}

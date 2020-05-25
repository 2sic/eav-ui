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
  ModuleId: number;
  Title: string;
}

export class ViewUsageDataStatus {
  IsVisible: boolean;
  IsDeleted: boolean;
}

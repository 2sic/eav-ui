import { ViewUsageDataModule } from './view-usage-data.model';

export interface ViewUsage {
  Blocks: ViewUsageBlock[];
  Guid: string;
  Id: number;
  Name: string;
  Path: string;
}

export interface ViewUsageBlock {
  Guid: string;
  Id: number;
  Modules: ViewUsageModule[];
}

export interface ViewUsageModule extends ViewUsageDataModule {
  IsDeleted: boolean;
  Page: ViewUsagePage;
  ShowOnAllPages: boolean;
}

export interface ViewUsagePage {
  CultureCode: string;
  Id: number;
  Name: string;
  Title: string;
  Url: string;
  Visible: boolean;
}

import { ViewUsageDataModule } from './view-usage-data.model';

export class ViewUsage {
  Blocks: ViewUsageBlock[];
  Guid: string;
  Id: number;
  Name: string;
  Path: string;
}

export class ViewUsageBlock {
  Guid: string;
  Id: number;
  Modules: ViewUsageModule[];
}

export class ViewUsageModule extends ViewUsageDataModule {
  IsDeleted: boolean;
  Page: ViewUsagePage;
  ShowOnAllPages: boolean;
}

export class ViewUsagePage {
  CultureCode: string;
  Id: number;
  Name: string;
  Title: string;
  Url: string;
  Visible: boolean;
}

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

export class ViewUsageModule {
  Id: number;
  IsDeleted: boolean;
  ModuleId: number;
  Page: ViewUsagePage;
  ShowOnAllPages: boolean;
  Title: string;
}

export class ViewUsagePage {
  CultureCode: string;
  Id: number;
  Name: string;
  Title: string;
  Url: string;
  Visible: boolean;
}

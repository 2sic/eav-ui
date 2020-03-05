export class View {
  ContentType: ViewEntity;
  Guid: string;
  Id: number;
  IsHidden: boolean;
  ListContentType: ViewEntity;
  ListPresentationType: ViewEntity;
  Name: string;
  PresentationType: ViewEntity;
  TemplatePath: string;
  ViewNameInUrl: string;
}

// spm TODO: figure out what this type is
export class ViewEntity {
  DemoId: number;
  DemoTitle: string;
  Id: number;
  Name: string;
  StaticName: string;
}

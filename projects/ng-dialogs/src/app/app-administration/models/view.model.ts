export class View {
  ContentType: ViewEntity;
  Guid: string;
  HasQuery: boolean;
  Id: number;
  IsHidden: boolean;
  List: boolean;
  ListContentType: ViewEntity;
  ListPresentationType: ViewEntity;
  Name: string;
  PresentationType: ViewEntity;
  TemplatePath: string;
  ViewNameInUrl: string;

  /** How often this is used in ContentBlocks */
  Used: number;
}

// spm TODO: figure out what this type is
export class ViewEntity {
  DemoId: number;
  DemoTitle: string;
  Id: number;
  Name: string;
  StaticName: string;
}

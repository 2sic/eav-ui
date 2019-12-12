export class ContentTypeEdit {
  constructor(
    public StaticName: string,
    public Name: string,
    public Description: string,
    public Scope: string,
  ) { }
}

export class ContentTypeEditExtended extends ContentTypeEdit {
  constructor(
    StaticName: string,
    Name: string,
    Description: string,
    Scope: string,
    public ChangeStaticName: boolean,
    public NewStaticName: string,
  ) {
    super(StaticName, Name, Description, Scope);
  }
}

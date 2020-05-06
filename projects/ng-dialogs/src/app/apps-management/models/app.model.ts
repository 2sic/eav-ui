export class App {
  constructor(
    public Id: number,
    public IsApp: boolean,
    public Guid: string,
    public Name: string,
    public Folder: string,
    public AppRoot: string,
    public IsHidden: boolean,
    public ConfigurationId: number,
  ) { }
}

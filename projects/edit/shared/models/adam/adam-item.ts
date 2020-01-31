export class AdamItem {
  constructor(
    public Id: number,
    public IsFolder: boolean,
    public MetadataId: number,
    public Name: string,
    public ParentId: number,
    public Path: string,
    public Size: number,
    public Type: string,
    public FullPath: string,
    public AllowEdit: boolean,
    public Created: string,
    public Modified: string,
    public Subfolder?: string,
  ) { }
}

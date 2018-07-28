export class AdamItem {
    constructor(public Id: number,
        public IsFolder: boolean,
        public MetadataId: number,
        public Name: string,
        public ParentId: number,
        public Path: string,
        public Size: number,
        public Type: string,
        public FullPath: string) {
        this.Id = Id;
        this.IsFolder = IsFolder;
        this.MetadataId = MetadataId;
        this.Name = Name;
        this.ParentId = ParentId;
        this.Path = Path;
        this.Size = Size;
        this.Type = Type;
        this.FullPath = FullPath;
    }
}

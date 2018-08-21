export class AdamConfig {
    constructor(public autoLoad: boolean,
        public folderDepth: number,
        public subFolder: string) {
        this.autoLoad = autoLoad;
        this.folderDepth = folderDepth;
        this.subFolder = subFolder;
    }
}

export class EavConfiguration {
    constructor(public zoneId: string,
        public appId: string,
        public approot: string,
        public cbid: string,
        public debug: string,
        public dialog: string,
        public items: string,
        public lang: string,
        public langpri: string,
        public langs: string,
        public mid: string,
        public mode: string,
        public partOfPage: string,
        public portalroot: string,
        public publishing: string,
        public tid: string,
        // public user[canDesign]: string,
        // public user[canDevelop]: string,
        public websiteroot: string,
        // TODO: write type instead any
        public versioningOptions: any) {
        this.appId = appId;
        this.approot = approot;
        this.cbid = cbid;
        this.dialog = dialog;
        this.items = items;
        this.lang = lang;
        this.langpri = langpri;
        this.langs = langs;
        this.mid = mid;
        this.mode = mode;
        this.partOfPage = partOfPage;
        this.portalroot = portalroot;
        this.publishing = publishing;
        this.tid = tid;
        // this.user[canDesign] = user[canDesign];
        // this.user[canDevelop] = user[canDevelop];
        this.websiteroot = websiteroot;
        this.versioningOptions = versioningOptions;
    }
}








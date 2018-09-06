export class Feature {
    constructor(public enabled: boolean,
        public expires: string,
        public id: string,
        public isPublic: boolean,
        public ui: boolean) {
        this.enabled = enabled;
        this.expires = expires;
        this.id = id;
        this.isPublic = isPublic;
        this.ui = ui;
    }

    /**
     * Features array from service have one key different ('public' is a reserved word in strict mode )
     * key 'public' convert to 'isPublic'
     * @param features
     */
    public static createFeatureArray(features: any[]) {
        const featureList: Feature[] = [];
        features.forEach(f => {
            featureList.push(new Feature(f.enabled, f.expires, f.id, f.public, f.ui));
        });
        return featureList;
    }
}



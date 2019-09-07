
export class InputType {
    constructor(
        public AngularAssets: string,
        public AngularMode: string,
        public Assets: string,
        public Description: string,
        public DisableI18n: boolean,
        public Label: string,
        public Type: string,
    ) {
        this.AngularAssets = AngularAssets;
        this.AngularMode = AngularMode;
        this.Assets = Assets;
        this.Description = Description;
        this.DisableI18n = DisableI18n;
        this.Label = Label;
        this.Type = Type;
    }
}

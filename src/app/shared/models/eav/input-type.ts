
export class InputType {
    constructor(
        public Assets: string,
        public Description: string,
        public Label: string,
        public Type: string,
        public DisableI18n: boolean
    ) {
        this.Assets = Assets;
        this.Description = Description;
        this.Label = Label;
        this.Type = Type;
        this.DisableI18n = DisableI18n;
    }
}

import { EavAttributes } from './eav-attributes';

export class LinkToOtherLanguageData {
    constructor(
        public formId: number,
        public linkType: string,
        public language: string,
        public defaultLanguage?: string,
        public attributes?: EavAttributes,
        public attributeKey?: string,
    ) {
        this.formId = formId;
        this.linkType = linkType;
        this.language = language;
        this.defaultLanguage = defaultLanguage;
        this.attributes = attributes;
        this.attributeKey = attributeKey;
    }
}

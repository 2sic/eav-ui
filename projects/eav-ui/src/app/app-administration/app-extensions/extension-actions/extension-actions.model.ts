import { Extension } from "../../models/extension.model";

export type ExtensionItemType = 'edit' | 'download';

export interface ExtensionActionsParams {
  do(verb: ExtensionItemType, extension: Extension): void;
  urlTo(verb: ExtensionItemType, extension: Extension): string;
}

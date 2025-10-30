import { Extension } from "../app-extensions.component";

export type ExtensionItemType = 'edit';

export interface ExtensionActionsParams {
  do(verb: ExtensionItemType, extension: Extension): void;
  urlTo(verb: ExtensionItemType, extension: Extension): string;
}

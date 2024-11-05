import { HttpClient } from "@angular/common/http";
import { TranslateLoader } from "@ngx-translate/core";
import { EavWindow } from "../shared/models/eav-window.model";
import { TranslateLoaderWithErrorHandling } from "../shared/translation";

declare const window: EavWindow;

export function translateLoaderFactoryCode(http: HttpClient): TranslateLoader {
  return new TranslateLoaderWithErrorHandling(http, './i18n/code-editor.', `.js?${window.sxcVersion}`);
}

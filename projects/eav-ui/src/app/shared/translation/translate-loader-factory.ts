import { HttpClient } from "@angular/common/http";
import { TranslateLoader } from "@ngx-translate/core";
import { EavWindow } from "../models/eav-window.model";
import { TranslateLoaderWithErrorHandling } from "./translate-loader-with-error-handling";

declare const window: EavWindow;

// AoT requires an exported function for factories
// at least according to https://github.com/ngx-translate/http-loader
export function translateLoaderFactory(http: HttpClient): TranslateLoader {
    return new TranslateLoaderWithErrorHandling(http, './i18n/', `.js?${window.sxcVersion}`);
}
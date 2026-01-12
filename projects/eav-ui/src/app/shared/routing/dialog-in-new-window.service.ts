import { inject, Injectable } from '@angular/core';
import { DialogTypeConstants } from '../constants/dialog-type.constants';
// tslint:disable-next-line:max-line-length
import { keyAppId, keyContentBlockId, keyDebug, keyDialog, keyExtras, keyIsShared, keyItems, keyModuleId, keyPartOfPage, keyUrl, keyZoneId, prefix } from '../constants/session.constants';
import { ViewOrFileIdentifier } from '../models/edit-form.model';
import { ItemIdHelper } from '../models/item-id-helper';
import { Context } from '../services/context';
import { ExtrasParam } from './dialog-url-params.model';

/**
 * Service to open dialogs in a new window.
 */
@Injectable()
export class DialogInNewWindowService {

  protected context = inject(Context);

  openCodeFile(path: string, isShared: boolean, templateId?: number) {
    const form = {
      items: [{
        Path: path,
        ...(templateId != null && ItemIdHelper.editId(templateId)),
      }] as ViewOrFileIdentifier[]
    };

    const hashParams: Record<string, string> = {
      ...this.#buildHashParam(keyDialog, DialogTypeConstants.Develop),
      ...this.#buildHashParam(keyIsShared, isShared.toString()),
      ...this.#buildHashParam(keyItems, JSON.stringify(form.items)),
    };
    const url = this.#buildFullUrl(hashParams);
    window.open(url, '_blank');
  }

  openAppAdministration(zoneId: number, appId: number, tab?: string, scope?: string) {
    const extras: ExtrasParam = {
      ...(tab && { tab }),
      ...(scope && { scope }),
    };
    const hashParams: Record<string, string> = {
      ...this.#buildHashParam(keyZoneId, zoneId.toString()),
      ...this.#buildHashParam(keyAppId, appId.toString()),
      ...this.#buildHashParam(keyDialog, DialogTypeConstants.App),
      ...(Object.keys(extras).length ? this.#buildHashParam(keyExtras, JSON.stringify(extras)) : ''),
    };
    const url = this.#buildFullUrl(hashParams);
    window.open(url, '_blank');
  }

  /** A lot of the link is identical when opening the admin-dialogs in a new window */
  #buildSharedHashParams() {
    const hashParams: Record<string, string> = {
      ...this.#buildHashParam(keyZoneId, this.context.zoneId),
      ...this.#buildHashParam(keyAppId, this.context.appId),
      ...this.#buildHashParam(keyModuleId, this.context.moduleId?.toString()),
      ...this.#buildHashParam(keyContentBlockId, this.context.contentBlockId?.toString()),
      ...this.#buildHashParam(keyPartOfPage),
      ...(sessionStorage.getItem(keyDebug) ? this.#buildHashParam(keyDebug) : {}),
    };
    return hashParams;
  }

  /** Encodes param if necessary */
  #buildHashParam(key: string, value?: number | string) {
    const rawKey = key.replace(prefix, '');
    const valueTemp = value ?? sessionStorage.getItem(key);
    const rawValue = encodeURIComponent(valueTemp);
    const hashParam: Record<string, string> = { [rawKey]: rawValue };
    return hashParam;
  }

  /** Builds the full (ugly) url with all the hash parameters */
  #buildFullUrl(hashParams: Record<string, string>) {
    const oldHref = sessionStorage.getItem(keyUrl);
    const oldUrl = new URL(oldHref);
    const newHref = oldUrl.origin + oldUrl.pathname + oldUrl.search;

    const allHashParams: Record<string, string> = {
      ...this.#buildSharedHashParams(),
      ...hashParams,
    };
    const hashUrl = Object.entries(allHashParams).reduce((acc, [key, value]) => `${acc}&${key}=${value}`, '').replace('&', '#');
    return newHref + hashUrl;
  }
}

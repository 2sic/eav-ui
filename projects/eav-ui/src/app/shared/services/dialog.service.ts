import { Injectable } from '@angular/core';
import { DialogTypeConstants } from '../constants/dialog-type.constants';
// tslint:disable-next-line:max-line-length
import { keyAppId, keyContentBlockId, keyDebug, keyDialog, keyExtras, keyIsShared, keyItems, keyModuleId, keyPartOfPage, keyPipelineId, keyUrl, keyZoneId, prefix } from '../constants/session.constants';
import { DialogHashParams, ExtrasParam } from '../models/dialog-url-params.model';
import { EditForm, EditPrep, ViewOrFileIdentifier } from '../models/edit-form.model';
import { HttpServiceBase } from './http-service-base';

@Injectable()
export class DialogService extends HttpServiceBase {

  openCodeFile(path: string, isShared: boolean, templateId?: number) {
    const dialog = DialogTypeConstants.Develop;
    const form = {
      items: [{
        Path: path,
        ...(templateId != null && EditPrep.editId(templateId)),
      }] as ViewOrFileIdentifier[]
    };

    const hashParams: DialogHashParams = {
      ...this.buildHashParam(keyDialog, dialog),
      ...this.buildHashParam(keyIsShared, isShared.toString()),
      ...this.buildHashParam(keyItems, JSON.stringify(form.items)),
    };
    const url = this.buildFullUrl(hashParams);
    window.open(url, '_blank');
  }

  openQueryDesigner(queryId: number) {
    const dialog = DialogTypeConstants.PipelineDesigner;
    const form: EditForm = {
      items: [EditPrep.editId(queryId)],
    };

    const hashParams: DialogHashParams = {
      ...this.buildHashParam(keyDialog, dialog),
      ...this.buildHashParam(keyPipelineId, queryId.toString()),
      ...this.buildHashParam(keyItems, JSON.stringify(form.items)),
    };
    const url = this.buildFullUrl(hashParams);
    window.open(url, '_blank');
  }

  openAppsManagement(zoneId: number, tab?: string) {
    const extras: ExtrasParam = {
      ...(tab && { tab }),
    };
    const hashParams: DialogHashParams = {
      ...this.buildHashParam(keyZoneId, zoneId.toString()),
      ...this.buildHashParam(keyDialog, DialogTypeConstants.Zone),
      ...(Object.keys(extras).length ? this.buildHashParam(keyExtras, JSON.stringify(extras)) : ''),
    };
    const url = this.buildFullUrl(hashParams);
    window.open(url, '_blank');
  }

  openAppAdministration(zoneId: number, appId: number, tab?: string, scope?: string) {
    const extras: ExtrasParam = {
      ...(tab && { tab }),
      ...(scope && { scope }),
    };
    const hashParams: DialogHashParams = {
      ...this.buildHashParam(keyZoneId, zoneId.toString()),
      ...this.buildHashParam(keyAppId, appId.toString()),
      ...this.buildHashParam(keyDialog, DialogTypeConstants.App),
      ...(Object.keys(extras).length ? this.buildHashParam(keyExtras, JSON.stringify(extras)) : ''),
    };
    const url = this.buildFullUrl(hashParams);
    window.open(url, '_blank');
  }

  /** A lot of the link is identical when opening the admin-dialogs in a new window */
  private buildSharedHashParams() {
    const hashParams: DialogHashParams = {
      ...this.buildHashParam(keyZoneId, this.zoneId),
      ...this.buildHashParam(keyAppId, this.appId),
      ...this.buildHashParam(keyModuleId, this.context.moduleId?.toString()),
      ...this.buildHashParam(keyContentBlockId, this.context.contentBlockId?.toString()),
      ...this.buildHashParam(keyPartOfPage),
      ...(sessionStorage.getItem(keyDebug) ? this.buildHashParam(keyDebug) : {}),
    };
    return hashParams;
  }

  /** Encodes param if necessary */
  private buildHashParam(key: string, value?: string) {
    const rawKey = key.replace(prefix, '');
    const valueTemp = (value != null) ? value : sessionStorage.getItem(key);
    const rawValue = encodeURIComponent(valueTemp);
    const hashParam: DialogHashParams = { [rawKey]: rawValue };
    return hashParam;
  }

  private buildFullUrl(hashParams: DialogHashParams) {
    const oldHref = sessionStorage.getItem(keyUrl);
    const oldUrl = new URL(oldHref);
    const newHref = oldUrl.origin + oldUrl.pathname + oldUrl.search;

    const allHashParams: DialogHashParams = {
      ...this.buildSharedHashParams(),
      ...hashParams,
    };
    const hashUrl = Object.entries(allHashParams).reduce((acc, [key, value]) => `${acc}&${key}=${value}`, '').replace('&', '#');
    return newHref + hashUrl;
  }
}

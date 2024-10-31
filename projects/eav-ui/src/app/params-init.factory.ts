import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Of } from '../../../core';
import { UrlHelpers } from './edit/shared/helpers/url.helpers';
import { DialogTypeConstants } from './shared/constants/dialog-type.constants';
import { keyAppId, keyContentBlockId, keyContentType, keyDialog, keyExtras, keyItems, keyModuleId, keyPipelineId, keyUrl, keyZoneId, prefix } from './shared/constants/session.constants';
import { convertFormToUrl } from './shared/helpers/url-prep.helper';
import { classLog } from './shared/logging';
import { ExtrasParam } from './shared/models/dialog-url-params.model';
import { EavWindow } from './shared/models/eav-window.model';
import { EditForm, ItemEditIdentifier, ItemInListIdentifier } from './shared/models/edit-form.model';

declare const window: EavWindow;

/**
 * Simple factory which is used by Angular Routing to figure out the APP_INITIALIZER
 * @param injector injector which is provided by Angular, required to get the Router
 * @returns 
 */
export function paramsInitFactory(injector: Injector): () => void {

  /** Helper to transfer various url-parameters to the session */
  function transferParamsToSessionStorage(queryParametersFromUrl: Record<string, string>): void {
    for (const [paramKey, paramValue] of Object.entries(queryParametersFromUrl)) {
      if (paramValue == null) continue;
      sessionStorage.setItem(prefix + paramKey, paramValue);
    }
  }

  /** Log initial route so a developer can re-open the dialog with the link in the console */
  function logInitialRoute(url?: string): void {
    console.log('Initial route:', url ?? window.location.href);
  }

  const log = classLog({ paramsInitFactory }, null, true);

  return () => {
    const l = log.fn('paramsInitFactory');
    // console.log('Setting parameters config and clearing route');
    const s = sessionStorage;
    const eavKeys = Object.keys(s).filter(key => key.startsWith(prefix));
    const urlHash = window.location.hash;
    const isParamsRoute = !urlHash.startsWith('#/');
    if (isParamsRoute) {
      l.a('is Params Route - will process', { urlHash, eavKeys });
      logInitialRoute();

      // Flush our part of the session, just to be sure it's a clean slate
      for (const key of eavKeys)
        s.removeItem(key);

      // save url which opened the dialog and set edit dialog as the default
      s.setItem(keyUrl, window.location.href);
      s.setItem(keyDialog, DialogTypeConstants.Edit);

      // Transfer URL params to session storage, without the leading '#' char
      const paramsDic = UrlHelpers.urlParamsToDic(urlHash.substring(1));
      transferParamsToSessionStorage(paramsDic);

      // Redirect to the expected dialog
      const router = injector.get(Router);
      const zoneId = s.getItem(keyZoneId);
      const appId = s.getItem(keyAppId);
      const dialog = s.getItem(keyDialog) as Of<typeof DialogTypeConstants>;
      const contentType = s.getItem(keyContentType);
      const items = s.getItem(keyItems);
      const getZoneFull = () => `${zoneId}/v2/${s.getItem(keyModuleId)}/${s.getItem(keyContentBlockId)}`;
      const getZoneApp = () => `${zoneId}/${appId}`;
      const getZoneAppFull = () => `${zoneId}/v2/${s.getItem(keyModuleId)}/${s.getItem(keyContentBlockId)}/${appId}`;
      l.a('dialog: ' + dialog);
      switch (dialog) {
        case DialogTypeConstants.Zone:
          const extrasZone: ExtrasParam = JSON.parse(s.getItem(keyExtras));
          router.navigate([`${getZoneFull()}/apps${extrasZone?.tab ? `/${extrasZone.tab}` : ''}`]);
          break;
        case DialogTypeConstants.Apps:
          router.navigate([`${getZoneFull()}/apps/list`]);
          break;
        case DialogTypeConstants.AppImport:
          router.navigate([`${getZoneFull()}/import`]);
          break;
        case DialogTypeConstants.App:
          const extrasApp: ExtrasParam = JSON.parse(s.getItem(keyExtras));
          router.navigate([`${getZoneAppFull()}/app${extrasApp?.tab ? `/${extrasApp.tab}` : ''}${extrasApp?.scope ? `/${extrasApp.scope}` : ''}`]);
          break;
        case DialogTypeConstants.ContentType:
          router.navigate([`${getZoneApp()}/fields/${contentType}`]);
          break;
        case DialogTypeConstants.ContentItems:
          router.navigate([`${getZoneApp()}/items/${contentType}`]);
          break;
        case DialogTypeConstants.Edit:
          const editItems: ItemEditIdentifier[] = JSON.parse(items);
          const form: EditForm = { items: editItems };
          const formUrl = convertFormToUrl(form);
          router.navigate([`${getZoneApp()}/edit/${formUrl}`]);
          break;
        case DialogTypeConstants.ItemHistory:
          const historyItems: ItemEditIdentifier[] = JSON.parse(items);
          router.navigate([`${getZoneApp()}/versions/${historyItems[0].EntityId}`]);
          break;
        case DialogTypeConstants.Develop:
          router.navigate([`${getZoneApp()}/code`]);
          break;
        case DialogTypeConstants.PipelineDesigner:
          const pipelineId = s.getItem(keyPipelineId);
          router.navigate([`${getZoneApp()}/query/${pipelineId}`]);
          break;
        case DialogTypeConstants.Replace:
          const repItem = (JSON.parse(items) as ItemInListIdentifier[])[0];
          const rGuid = repItem.Parent;
          const rPart = repItem.Field;
          const rIndex = repItem.Index;
          const add = repItem.Add;
          const queryParams = add ? { add: true } : {};
          router.navigate([`${getZoneApp()}/${rGuid}/${rPart}/${rIndex}/replace`], { queryParams });
          break;
        case DialogTypeConstants.InstanceList:
          const grpItem = (JSON.parse(items) as ItemInListIdentifier[])[0];
          const gGuid = grpItem.Parent;
          const gPart = grpItem.Field;
          const gIndex = grpItem.Index;
          router.navigate([`${getZoneApp()}/${gGuid}/${gPart}/${gIndex}/reorder`]);
          break;
        default:
          alert(`Cannot open unknown dialog "${dialog}"`);
          try {
            window.parent.$2sxc.totalPopup.close();
          } catch (error) { }
      }
    } else if (eavKeys.length === 0) {
      // if not params route and no params are saved, e.g. browser was reopened,
      // check if we have additional context info in the url behind a ##
      const urlWithCtx = urlHash.split('##')
      const finalRoute = urlWithCtx[0].substring(1);
      const routeParts = finalRoute.split('/'); // url is like '/73/0/42/-42/770/app/data/...'
      const zoneId = routeParts[1];
      const mid = routeParts[3];
      const cbid = routeParts[4];
      const appId = routeParts[5];
      if (!isNaN(+mid) && !isNaN(+cbid) && !isNaN(+appId)) {
        l.a('No Params Route and no params saved, but found context info in url, will process', { urlHash });
        logInitialRoute();
        const ctxAll = `zoneId=${zoneId}&appId=${appId}&mid=${mid}&cbid=${cbid}`;
        l.a('found ##', { urlHash, ctxAll, finalRoute });
        transferParamsToSessionStorage(UrlHelpers.urlParamsToDic(ctxAll));
        const router = injector.get(Router);
        router.navigate([finalRoute]);
        return l.end();
      }

      // if not params route and no params are saved, e.g. browser was reopened, throw error
      l.a('No Params Route and no params saved...');
      alert('Missing required url parameters. Please reopen dialog.');
      throw new Error('Missing required url parameters. Please reopen dialog.');
    } else {
      l.a('No Params Route, but params saved..., assume refresh of previously working UI');
      // Log initial route so a developer can re-open the dialog with the link in the console
      logInitialRoute(s.getItem(keyUrl));
    }
  };
}

import { Injector } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Of } from '../../../../../core';
import { UrlHelpers } from '../../edit/shared/helpers/url.helpers';
import { DialogTypeConstants } from '../constants/dialog-type.constants';
import { keyAppId, keyContentBlockId, keyContentType, keyDialog, keyExtras, keyItems, keyModuleId, keyPipelineId, keyUrl, keyZoneId, prefix } from '../constants/session.constants';
import { convertFormToUrl } from '../helpers/url-prep.helper';
import { classLog } from '../logging';
import { EavWindow } from '../models/eav-window.model';
import { EditForm, ItemEditIdentifier, ItemInListIdentifier } from '../models/edit-form.model';
import { ExtrasParam } from './dialog-url-params.model';
import { RouteContextInfo } from './route-context-info';
import { RouteLinkHelper } from './route-link-helper';

declare const window: EavWindow;

/**
 * Handler for entry URLs when the App loads.
 * Previously (before Angular 19) implemented as APP_INITIALIZER
 * Changed to be a standalone object 2025-03-20 v19.03.03
 */
export class AppEntryRouteHandler {
  log = classLog({ AppEntryRouteHandler }, {
    all: true,
    constructor: false,
    processEntryUrl: false,
    handleLongEntryRouteWithState: false,
    handleNonNormalEntryParamRoute: false,
    transferToSession: false,
  });

  /**
   * Constructor, will call initializer
   */
  constructor(private injector: Injector) {
    const l = this.log.fnIf('constructor');
    this.#processEntryUrl();
    l.end();
  }

  /**
   * Initializer
   * Will automatically do url checks and perform redirects if necessary
   */
  #processEntryUrl() {
    const l = this.log.fnIf('processEntryUrl', null, 'Setting parameters config and clearing route');
    
    // Case 1: Check if the url does not start with "#/" in which case it must be rewritten
    const isNotNormalRoute = !window.location.hash.startsWith('#/');
    if (isNotNormalRoute) {
      this.#logInitialRoute();
      this.handleLongEntryRouteWithState();
      return l.end();
    }
    
    // Case 2: Not normal entry-Param-Route
    // sessionStorage has no data, additional info seems to be behind ##
    // not sure how this would ever be hit...? 2025-03-20
    const eavKeys = Object.keys(sessionStorage).filter(key => key.startsWith(prefix));
    if (eavKeys.length === 0) {
      this.#logInitialRoute();
      this.#handleNonNormalEntryParamRoute();
      return l.end();
    }

    // Case 3: Normal entry-Param-Route - but refresh
    l.a('No Params Route, but params saved..., assume refresh of previously working UI');
    // Log initial route so a developer can re-open the dialog with the link in the console
    this.#logInitialRoute(sessionStorage.getItem(keyUrl));
    l.end();
  }


  /**
   * Handle long entry route with state - usually coming from the in-page toolbars
   * Will transfer the URL parameters to session storage and redirect to the expected dialog
   */
  handleLongEntryRouteWithState() {
    const l = this.log.fnIf('handleLongEntryRouteWithState');

    const sS = sessionStorage;
    const eavKeys = Object.keys(sS).filter(key => key.startsWith(prefix));
    const urlHash = window.location.hash;
  
    l.a('is Params Route - will process', { urlHash, eavKeys });

    // Flush our part of the session, just to be sure it's a clean slate
    for (const key of eavKeys)
      sS.removeItem(key);

    // save url which opened the dialog and set edit dialog as the default
    sS.setItem(keyUrl, window.location.href);
    sS.setItem(keyDialog, DialogTypeConstants.Edit);

    // Transfer URL params to session storage, without the leading '#' char
    const paramsDic = UrlHelpers.urlParamsToDic(urlHash.substring(1));
    this.#transferToSession(paramsDic);

    // Redirect to the expected dialog
    const router = this.injector.get(Router);
    const dialog = sS.getItem(keyDialog) as Of<typeof DialogTypeConstants>;
    const contentType = sS.getItem(keyContentType);
    const items = sS.getItem(keyItems);

    // New 2025-03-20; centralize code to create full route
    const getFull = () => new RouteLinkHelper().routeRoot({
      zoneId: sS.getItem(keyZoneId),
      moduleId: sS.getItem(keyModuleId),
      contentBlockId: sS.getItem(keyContentBlockId),
      appId: sS.getItem(keyAppId),
    } satisfies RouteContextInfo);
    l.a('dialog: ' + dialog);

    function go(route: string, extras?: NavigationExtras) {
      router.navigate([`${getFull()}${route}`], extras);
      l.end(dialog);
    }

    switch (dialog) {
      case DialogTypeConstants.Zone:
        const extrasZone: ExtrasParam = JSON.parse(sS.getItem(keyExtras));
        return go(`/apps${extrasZone?.tab ? `/${extrasZone.tab}` : ''}`);

      case DialogTypeConstants.Apps:
        return go(`/apps/list`);

      case DialogTypeConstants.AppImport:
        return go(`/import`);

      case DialogTypeConstants.App:
        const extrasApp: ExtrasParam = JSON.parse(sS.getItem(keyExtras));
        return go(`/app${extrasApp?.tab ? `/${extrasApp.tab}` : ''}${extrasApp?.scope ? `/${extrasApp.scope}` : ''}`);

      case DialogTypeConstants.ContentType:
        return go(`/fields/${contentType}`);

      case DialogTypeConstants.ContentItems:
        return go(`/items/${contentType}`);

      case DialogTypeConstants.Edit:
        const editItems: ItemEditIdentifier[] = JSON.parse(items);
        const formUrl = convertFormToUrl({ items: editItems } satisfies EditForm);
        return go(`/edit/${formUrl}`);

      case DialogTypeConstants.ItemHistory:
        const historyItems: ItemEditIdentifier[] = JSON.parse(items);
        return go(`/versions/${historyItems[0].EntityId}`);

      case DialogTypeConstants.Develop:
        return go(`/code`);

      case DialogTypeConstants.PipelineDesigner:
        const pipelineId = sS.getItem(keyPipelineId);
        return go(`/query/${pipelineId}`);

      case DialogTypeConstants.Replace:
        const repItem = (JSON.parse(items) as ItemInListIdentifier[])[0];
        const queryParams = repItem.Add ? { add: true } : {};
        return go(`/${repItem.Parent}/${repItem.Field}/${repItem.Index}/replace`, { queryParams });

      case DialogTypeConstants.InstanceList:
        const grpItem = (JSON.parse(items) as ItemInListIdentifier[])[0];
        return go(`/${grpItem.Parent}/${grpItem.Field}/${grpItem.Index}/reorder`);
        
      default:
        alert(`Cannot open unknown dialog "${dialog}"`);
        try {
          window.parent.$2sxc.totalPopup.close();
        } catch (error) { }
        return l.end(`error: ${dialog}`);
    }
  }

  // Note: 2025-03-20 not clear what this is for
  // - it seems to indicate that there are URLs with ## in them, but I can't see where
  // - but I can't seem to find a case where this is used
  // - so I ported it from the previous code, but couldn't really test / verify it
  // added console.error to spot if we ever see this
  // 2025-12-23 2pp had a screenshot showing this message, but we still don't know why he saw it...
  // also not sure if it actually found anything after the ##
  #handleNonNormalEntryParamRoute() {
    console.error('This code is believed to be unused - if you see this warning, please inform @ijungleboy and note what you clicked before you saw this message');
    const l = this.log.fnIf('handleNonNormalEntryParamRoute');
    // if not params route and no params are saved, e.g. browser was reopened,
    // check if we have additional context info in the url behind a ##
    const urlHash = window.location.hash;
    const urlWithCtx = urlHash.split('##')
    const finalRoute = urlWithCtx[0].substring(1);
    // url is like '/73/v2/42/-42/770/app/data/...'
    // or is like  '/73/v2/0/42/-42/770/apps/data/...'
    const routeParts = finalRoute.split('/');
    const zoneId = routeParts[1];
    const mid = routeParts[3];
    const cbid = routeParts[4];
    const appId = routeParts[5];
    if (!isNaN(+mid) && !isNaN(+cbid) && !isNaN(+appId)) {
      l.a('No Params Route and no params saved, but found context info in url, will process', { urlHash });
      const ctxAll = `zoneId=${zoneId}&appId=${appId}&mid=${mid}&cbid=${cbid}`;
      l.a('found ##', { urlHash, ctxAll, finalRoute });
      this.#transferToSession(UrlHelpers.urlParamsToDic(ctxAll));
      const router = this.injector.get(Router);
      router.navigate([finalRoute]);
      return l.end();
    }

    // if not params route and no params are saved, e.g. browser was reopened, throw error
    l.a('No Params Route and no params saved...');
    alert('Missing required url parameters. Please reopen dialog.');
    throw new Error('Missing required url parameters. Please reopen dialog.');
  }

  /** Log initial route so a developer can re-open the dialog with the link in the console */
  #logInitialRoute(url?: string): void {
    console.log('Initial route:', url ?? window.location.href);
  }
  
  /** Helper to transfer various url-parameters to the session */
  #transferToSession(queryParametersFromUrl: Record<string, string>): void {
    const l = this.log.fnIf('transferToSession', { queryParametersFromUrl });
    for (const [paramKey, paramValue] of Object.entries(queryParametersFromUrl))
      if (paramValue != null)
        sessionStorage.setItem(prefix + paramKey, paramValue);
    l.end();
  }

}


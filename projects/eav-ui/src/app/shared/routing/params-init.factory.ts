
// Backup 2025-03-20 2dm - remove ca. 2025-05-01

// import { Injector } from '@angular/core';
// import { Router } from '@angular/router';
// import { Of } from '../../../../../core';
// import { UrlHelpers } from '../../edit/shared/helpers/url.helpers';
// import { DialogTypeConstants } from '../constants/dialog-type.constants';
// import { keyAppId, keyContentBlockId, keyContentType, keyDialog, keyExtras, keyItems, keyModuleId, keyPipelineId, keyUrl, keyZoneId, prefix } from '../constants/session.constants';
// import { convertFormToUrl } from '../helpers/url-prep.helper';
// import { classLog } from '../logging';
// import { EavWindow } from '../models/eav-window.model';
// import { EditForm, ItemEditIdentifier, ItemInListIdentifier } from '../models/edit-form.model';
// import { ExtrasParam } from './dialog-url-params.model';
// import { RouteContextInfo } from './route-context-info';
// import { RouteLinkHelper } from './route-link-helper';

// declare const window: EavWindow;

// /**
//  * Simple factory which is used by Angular Routing to figure out the APP_INITIALIZER
//  * @param injector injector which is provided by Angular, required to get the Router
//  * @returns 
//  */
// export function paramsInitFactoryOldForReference(injector: Injector): () => void {

//   const log = classLog({ paramsInitFactoryOldForReference });

//   return () => {
//     const l = log.fn('paramsInitFactory');
//     // console.log('Setting parameters config and clearing route');
//     const sS = sessionStorage;
//     const eavKeys = Object.keys(sS).filter(key => key.startsWith(prefix));
//     const urlHash = window.location.hash;
//     const isParamsRoute = !urlHash.startsWith('#/');
//     if (isParamsRoute) {
//       l.a('is Params Route - will process', { urlHash, eavKeys });
//       logInitialRoute();

//       // Flush our part of the session, just to be sure it's a clean slate
//       for (const key of eavKeys)
//         sS.removeItem(key);

//       // save url which opened the dialog and set edit dialog as the default
//       sS.setItem(keyUrl, window.location.href);
//       sS.setItem(keyDialog, DialogTypeConstants.Edit);

//       // Transfer URL params to session storage, without the leading '#' char
//       const paramsDic = UrlHelpers.urlParamsToDic(urlHash.substring(1));
//       transferParamsToSessionStorage(paramsDic);

//       // Redirect to the expected dialog
//       const router = injector.get(Router);
//       const dialog = sS.getItem(keyDialog) as Of<typeof DialogTypeConstants>;
//       const contentType = sS.getItem(keyContentType);
//       const items = sS.getItem(keyItems);
//       // Before 2025-03-20, keep for a few days
//       // const getFull = () => `${sS.getItem(keyZoneId)}/v2/${sS.getItem(keyModuleId)}/${sS.getItem(keyContentBlockId)}/${sS.getItem(keyAppId)}`;
//       // New 2025-03-20; centralize code to create full route
//       const getFull = () => new RouteLinkHelper().routeRoot({
//         zoneId: sS.getItem(keyZoneId),
//         moduleId: sS.getItem(keyModuleId),
//         contentBlockId: sS.getItem(keyContentBlockId),
//         appId: sS.getItem(keyAppId),
//       } satisfies RouteContextInfo);
//       l.a('dialog: ' + dialog);
//       switch (dialog) {
//         case DialogTypeConstants.Zone:
//           const extrasZone: ExtrasParam = JSON.parse(sS.getItem(keyExtras));
//           router.navigate([`${getFull()}/apps${extrasZone?.tab ? `/${extrasZone.tab}` : ''}`]);
//           return;
//         case DialogTypeConstants.Apps:
//           router.navigate([`${getFull()}/apps/list`]);
//           return;
//         case DialogTypeConstants.AppImport:
//           router.navigate([`${getFull()}/import`]);
//           return;
//         case DialogTypeConstants.App:
//           const extrasApp: ExtrasParam = JSON.parse(sS.getItem(keyExtras));
//           router.navigate([`${getFull()}/app${extrasApp?.tab ? `/${extrasApp.tab}` : ''}${extrasApp?.scope ? `/${extrasApp.scope}` : ''}`]);
//           return;
//         case DialogTypeConstants.ContentType:
//           router.navigate([`${getFull()}/fields/${contentType}`]);
//           return;
//         case DialogTypeConstants.ContentItems:
//           router.navigate([`${getFull()}/items/${contentType}`]);
//           return;
//         case DialogTypeConstants.Edit:
//           const editItems: ItemEditIdentifier[] = JSON.parse(items);
//           const form: EditForm = { items: editItems };
//           const formUrl = convertFormToUrl(form);
//           router.navigate([`${getFull()}/edit/${formUrl}`]);
//           return;
//         case DialogTypeConstants.ItemHistory:
//           const historyItems: ItemEditIdentifier[] = JSON.parse(items);
//           router.navigate([`${getFull()}/versions/${historyItems[0].EntityId}`]);
//           return;
//         case DialogTypeConstants.Develop:
//           router.navigate([`${getFull()}/code`]);
//           return;
//         case DialogTypeConstants.PipelineDesigner:
//           const pipelineId = sS.getItem(keyPipelineId);
//           router.navigate([`${getFull()}/query/${pipelineId}`]);
//           return;
//         case DialogTypeConstants.Replace:
//           const repItem = (JSON.parse(items) as ItemInListIdentifier[])[0];
//           const rGuid = repItem.Parent;
//           const rPart = repItem.Field;
//           const rIndex = repItem.Index;
//           const add = repItem.Add;
//           const queryParams = add ? { add: true } : {};
//           router.navigate([`${getFull()}/${rGuid}/${rPart}/${rIndex}/replace`], { queryParams });
//           return;
//         case DialogTypeConstants.InstanceList:
//           const grpItem = (JSON.parse(items) as ItemInListIdentifier[])[0];
//           const gGuid = grpItem.Parent;
//           const gPart = grpItem.Field;
//           const gIndex = grpItem.Index;
//           router.navigate([`${getFull()}/${gGuid}/${gPart}/${gIndex}/reorder`]);
//           return;
//         default:
//           alert(`Cannot open unknown dialog "${dialog}"`);
//           try {
//             window.parent.$2sxc.totalPopup.close();
//           } catch (error) { }
//           return;
//       }
//     }
    
//     // Not normal entry-Param-Route
//     if (eavKeys.length === 0) {
//       // if not params route and no params are saved, e.g. browser was reopened,
//       // check if we have additional context info in the url behind a ##
//       const urlWithCtx = urlHash.split('##')
//       const finalRoute = urlWithCtx[0].substring(1);
//       // url is like '/73/v2/42/-42/770/app/data/...'
//       // or is like  '/73/v2/0/42/-42/770/apps/data/...'
//       const routeParts = finalRoute.split('/');
//       const zoneId = routeParts[1];
//       const mid = routeParts[3];
//       const cbid = routeParts[4];
//       const appId = routeParts[5];
//       if (!isNaN(+mid) && !isNaN(+cbid) && !isNaN(+appId)) {
//         l.a('No Params Route and no params saved, but found context info in url, will process', { urlHash });
//         logInitialRoute();
//         const ctxAll = `zoneId=${zoneId}&appId=${appId}&mid=${mid}&cbid=${cbid}`;
//         l.a('found ##', { urlHash, ctxAll, finalRoute });
//         transferParamsToSessionStorage(UrlHelpers.urlParamsToDic(ctxAll));
//         const router = injector.get(Router);
//         router.navigate([finalRoute]);
//         return l.end();
//       }

//       // if not params route and no params are saved, e.g. browser was reopened, throw error
//       l.a('No Params Route and no params saved...');
//       alert('Missing required url parameters. Please reopen dialog.');
//       throw new Error('Missing required url parameters. Please reopen dialog.');
//     } else {
//       l.a('No Params Route, but params saved..., assume refresh of previously working UI');
//       // Log initial route so a developer can re-open the dialog with the link in the console
//       logInitialRoute(sS.getItem(keyUrl));
//     }
//   };
// }

//   /** Helper to transfer various url-parameters to the session */
//   function transferParamsToSessionStorage(queryParametersFromUrl: Record<string, string>): void {
//     for (const [paramKey, paramValue] of Object.entries(queryParametersFromUrl)) {
//       if (paramValue == null) continue;
//       sessionStorage.setItem(prefix + paramKey, paramValue);
//     }
//   }

//   /** Log initial route so a developer can re-open the dialog with the link in the console */
//   function logInitialRoute(url?: string): void {
//     console.log('Initial route:', url ?? window.location.href);
//   }

import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { Component, HostBinding, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map, share, switchMap, take } from 'rxjs/operators';
import { DevRestBase } from '..';
import { AppDialogConfigService } from '../../app-administration/services';
import { WebApisService } from '../../app-administration/services/web-apis.service';
import { Context } from '../../shared/services/context';
import { DevRestApiTemplateVars } from './api-template-vars';
import { GoToDevRest } from '../go-to-dev-rest';
import { generateWebApiCalls } from './api-samples';

const pathToApi = 'app/{appname}/api/{controller}/{action}';

@Component({
  selector: 'app-dev-rest-api',
  templateUrl: './api.component.html',
  styleUrls: ['../dev-rest-all.scss', '../header-selector.scss'],
})
export class DevRestApiComponent extends DevRestBase<DevRestApiTemplateVars> implements OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  /** action name to check for */
  selectedActionName$ = new BehaviorSubject<string>(null);

  /** Test values for url params */
  urlParams$ = new BehaviorSubject<string>('');

  constructor(
    appDialogConfigService: AppDialogConfigService,
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    context: Context,
    dnnContext: DnnContext,
    dialogRef: MatDialogRef<DevRestApiComponent>,
    router: Router,
    route: ActivatedRoute,
    private webApisService: WebApisService,
  ) {
    super(appDialogConfigService, context, dialogRef, dnnContext, router, route, null);

    const webApi$ = combineLatest([
      this.route.paramMap.pipe(map(pm => pm.get(GoToDevRest.paramApiPath))),
      this.webApisService.getAll()
    ]).pipe(map(([name, webApis]) => {
      name = decodeURIComponent(name);
      return webApis.find(w => w.path === name);
    }));


    const apiDetails$ = webApi$.pipe(
      switchMap(webApi => this.webApisService.details(webApi.path)),
      share());
    apiDetails$.pipe(take(1), filter(x => !!x?.actions?.length)).subscribe(x => this.selectedActionName$.next(x?.actions[0]?.name));
    // apiDetails$.subscribe(x => console.log('details', x));

    const selectedAction$ = combineLatest([apiDetails$, this.selectedActionName$])
      .pipe(map(([details, name]) => details?.actions?.find(a => a.name == name)));

    // Build Root Stream for the root folder
    const root$ = combineLatest([webApi$, apiDetails$, selectedAction$, this.scenario$, this.dialogSettings$]).pipe(
      map(([webApi, details, action, scenario, dialogSettings]) => {
        console.log('webApi object', webApi);
        const resolved = pathToApi
          .replace('{appname}', scenario.inSameContext ? 'auto' : encodeURI(dialogSettings.Context.App.Folder))
          .replace('/api/', `/${webApi.folder}/`)
          .replace('{controller}', details.controller.replace(/controller/i, ''))
          .replace('{action}', action.name);
        return this.rootBasedOnScenario(resolved, scenario);
      }),
    );

    this.templateVars$ = combineLatest([
      combineLatest([webApi$, apiDetails$, selectedAction$, this.urlParams$, this.scenario$]),
      combineLatest([root$, this.dialogSettings$]),
    ])
      .pipe(
        map(([[webApi, details, selected, urlParams, scenario], [root, /* item, */ diag]]) => ({
          ...this.buildBaseTemplateVars(webApi.name, webApi.path, diag, null, root, scenario),
          webApi,
          details,
          selected: selected,
          permissionsHasAnonymous: true, // dummy value to prevent error being shown
          apiCalls: generateWebApiCalls(dnnContext.$2sxc, scenario, context, root, urlParams, selected.verbs),
        })),
      );
  }

  updateParams(event: Event) {
    this.urlParams$.next((event.target as HTMLInputElement).value);
  }


  updateAction(value: string) {
    this.selectedActionName$.next(value);
  }
}

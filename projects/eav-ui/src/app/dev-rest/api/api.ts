import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { AsyncPipe } from '@angular/common';
import { Component, HostBinding, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, share, shareReplay, switchMap } from 'rxjs';
import { DevRestBase } from '..';
import { transient } from '../../../../../core';
import { classLog } from '../../../../../shared/logging';
import { SourceService } from '../../code-editor/services/source.service';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { RxTapDebug } from '../../shared/logging/rx-debug-dbg';
import { Context } from '../../shared/services/context';
import { DevRestUrlsAndCodeComponent } from '../dev-rest-urls-and-code/dev-rest-urls-and-code';
import { GoToDevRest } from '../go-to-dev-rest';
import { SelectorWithHelpComponent } from '../selector-with-help/selector-with-help';
import { DevRestTabExamplesComponent } from '../tab-examples/tab-examples';
import { DevRestHttpHeadersComponent } from '../tab-headers/tab-headers';
import { DevRestTabIntroductionComponent } from '../tab-introduction/tab-introduction';
import { DevRestApiActionParamsComponent } from './action-params/action-params';
import { generateWebApiCalls } from './api-samples';
import { DevRestApiModel } from './api-template-vars';
import { DevRestApiIntroductionComponent } from './introduction/introduction';
import { DevRestApiPermissionsComponent } from './permissions/permissions';

const pathToApi = 'app/{appname}/{endpointPath}/{action}';


@Component({
  selector: 'app-dev-rest-api',
  templateUrl: './api.html',
  styleUrls: ['../dev-rest-all.scss', '../header-selector.scss', './api.scss'],
  imports: [
    MatButtonModule,
    TippyDirective,
    MatIconModule,
    RouterOutlet,
    SelectorWithHelpComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    DevRestApiIntroductionComponent,
    DevRestTabIntroductionComponent,
    DevRestTabExamplesComponent,
    DevRestApiActionParamsComponent,
    MatExpansionModule,
    MatInputModule,
    DevRestUrlsAndCodeComponent,
    DevRestApiPermissionsComponent,
    DevRestHttpHeadersComponent,
    AsyncPipe,
  ]
})
export class DevRestApiComponent extends DevRestBase<DevRestApiModel> implements OnDestroy {

  log = classLog({ DevRestApiComponent });

  @HostBinding('className') hostClass = 'dialog-component';

  /** action name to check for */
  selectedActionName$ = new BehaviorSubject<string>(null);

  /** Test values for url params */
  urlParams$ = new BehaviorSubject<string>('');

  private sourceService = transient(SourceService);

  constructor(
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    context: Context,
    dnnContext: DnnContext,
    dialog: MatDialogRef<DevRestApiComponent>,
    router: Router,
    route: ActivatedRoute,
  ) {
    super(context, dialog, dnnContext, router, route, null);

    const logWebApi = new RxTapDebug(this.log, 'webApi$', true);
    const webApi$ = combineLatest([
      this.route.paramMap.pipe(map(pm => pm.get(GoToDevRest.paramApiPath))),
      this.sourceService.getWebApis().pipe(shareReplay(1)),
    ]).pipe(
      logWebApi.pipe(),
      map(([name, webApis]) => {
        name = decodeURIComponent(name);
        return webApis.find(w => w.path === name);
      },
        logWebApi.map(),
      ));

    const apiDetails$ = webApi$.pipe(
      switchMap(webApi => this.sourceService.getWebApiDetails(webApi.path)),
      share()
    );

    const logToSelectedAction = new RxTapDebug(this.log, 'selectedActionName$', true);
    apiDetails$.pipe(
      logToSelectedAction.pipe(),
      // take(1),
      filter(x => !!x?.actions?.length),
      logToSelectedAction.filter(),
    ).subscribe(x => {
      this.log.a(`first action '${x?.actions[0]?.name}'`);
      return this.selectedActionName$.next(x?.actions[0]?.name);
    });

    const logSelectedActions = new RxTapDebug(this.log, 'selectedAction$', true);
    const selectedAction$ = combineLatest([apiDetails$, this.selectedActionName$])
      .pipe(
        logSelectedActions.pipe(),
        // add debounce because of diamond problem with apiDetails$ and selectedAction$
        // debounceTime(10),
        map(([details, name]) => details?.actions?.find(a => a.name === name)),
        logSelectedActions.map(),
        filter(x => !!x),
        logSelectedActions.filter(),
      );

    // Build Root Stream for the root folder
    const root$ = combineLatest([webApi$, selectedAction$, this.scenario$, this.dialogSettings$]).pipe(
      map(([webApi, action, scenario, dialogSettings]) => {
        const resolved = pathToApi
          .replace('{appname}', scenario.inSameContext ? 'auto' : encodeURI(dialogSettings.Context.App.Folder))
          .replace('{endpointPath}', webApi.endpointPath)
          .replace('{action}', action.name);
        return this.rootBasedOnScenario(resolved, scenario);
      }),
    );


    this.viewModel$ = combineLatest([
      combineLatest([webApi$, apiDetails$, selectedAction$, this.urlParams$, this.scenario$]),
      combineLatest([root$, this.dialogSettings$]),
    ])
      .pipe(
        map(([[webApi, details, selActions, urlParams, scenario], [root, diag]]) => ({
          ...this.buildBaseViewModel(webApi.name, webApi.endpointPath, diag, null, root, scenario),
          webApi,
          details,
          selected: selActions,
          permissionsHasAnonymous: true, // dummy value to prevent error being shown
          apiCalls: generateWebApiCalls(dnnContext.$2sxc, scenario, context, root, urlParams, selActions.verbs),
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

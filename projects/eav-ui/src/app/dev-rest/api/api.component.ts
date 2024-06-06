import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { Component, HostBinding, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, share, shareReplay, switchMap } from 'rxjs';
import { DevRestBase } from '..';
import { AppDialogConfigService } from '../../app-administration/services';
import { SourceService } from '../../code-editor/services/source.service';
import { Context } from '../../shared/services/context';
import { GoToDevRest } from '../go-to-dev-rest';
import { generateWebApiCalls } from './api-samples';
import { DevRestApiViewModel } from './api-template-vars';
import { AsyncPipe } from '@angular/common';
import { DevRestHttpHeadersComponent } from '../tab-headers/tab-headers.component';
import { DevRestApiPermissionsComponent } from './permissions/permissions.component';
import { DevRestUrlsAndCodeComponent } from '../dev-rest-urls-and-code/dev-rest-urls-and-code.component';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { DevRestApiActionParamsComponent } from './action-params/action-params.component';
import { DevRestTabExamplesComponent } from '../tab-examples/tab-examples.component';
import { DevRestTabIntroductionComponent } from '../tab-introduction/tab-introduction.component';
import { DevRestApiIntroductionComponent } from './introduction/introduction.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SelectorWithHelpComponent } from '../selector-with-help/selector-with-help.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TippyStandaloneDirective } from '../../shared/directives/tippy-Standalone.directive';
import { EavLogger } from '../../shared/logging/eav-logger';

const pathToApi = 'app/{appname}/{endpointPath}/{action}';
const logThis = false;
@Component({
    selector: 'app-dev-rest-api',
    templateUrl: './api.component.html',
    styleUrls: ['../dev-rest-all.scss', '../header-selector.scss'],
    standalone: true,
    imports: [
        MatButtonModule,
        TippyStandaloneDirective,
        MatIconModule,
        RouterOutlet,
        SelectorWithHelpComponent,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatTabsModule,
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
    ],
    providers: [
      SourceService,
      AppDialogConfigService,
    ],
})
export class DevRestApiComponent extends DevRestBase<DevRestApiViewModel> implements OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  /** action name to check for */
  selectedActionName$ = new BehaviorSubject<string>(null);

  /** Test values for url params */
  urlParams$ = new BehaviorSubject<string>('');

  log = new EavLogger("DevRestApiComponent", logThis);
  constructor(
    appDialogConfigService: AppDialogConfigService,
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    context: Context,
    dnnContext: DnnContext,
    dialogRef: MatDialogRef<DevRestApiComponent>,
    router: Router,
    route: ActivatedRoute,
    private sourceService: SourceService,
  ) {
    super(appDialogConfigService, context, dialogRef, dnnContext, router, route, null);

    const logWebApi = this.log.rxTap('webApi$', { enabled: true });
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

    const logToSelectedAction = this.log.rxTap('selectedActionName$', { enabled: true });
    apiDetails$.pipe(
      logToSelectedAction.pipe(),
      // take(1),
      filter(x => !!x?.actions?.length),
      logToSelectedAction.filter(),
    ).subscribe(x => {
      this.log.add('first action', x?.actions[0]?.name);
      return this.selectedActionName$.next(x?.actions[0]?.name);
    });

    var logSelectedActions = this.log.rxTap('selectedAction$', { enabled: true });
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

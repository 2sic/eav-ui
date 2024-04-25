import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { Component, HostBinding, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, share, switchMap, take } from 'rxjs';
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

const pathToApi = 'app/{appname}/{endpointPath}/{action}';

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

    const webApi$ = combineLatest([
      this.route.paramMap.pipe(map(pm => pm.get(GoToDevRest.paramApiPath))),
      this.sourceService.getWebApis(),
    ]).pipe(map(([name, webApis]) => {
      name = decodeURIComponent(name);
      return webApis.find(w => w.path === name);
    }));

    const apiDetails$ = webApi$.pipe(
      switchMap(webApi => this.sourceService.getWebApiDetails(webApi.path)),
      share());
    apiDetails$.pipe(take(1), filter(x => !!x?.actions?.length)).subscribe(x => this.selectedActionName$.next(x?.actions[0]?.name));
    // apiDetails$.subscribe(x => console.log('details', x));

    const selectedAction$ = combineLatest([apiDetails$, this.selectedActionName$])
      .pipe(map(([details, name]) => details?.actions?.find(a => a.name === name)));

    // Build Root Stream for the root folder
    const root$ = combineLatest([webApi$, apiDetails$, selectedAction$, this.scenario$, this.dialogSettings$]).pipe(
      map(([webApi, details, action, scenario, dialogSettings]) => {
        console.log('webApi object', webApi);
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
        map(([[webApi, details, selected, urlParams, scenario], [root, /* item, */ diag]]) => ({
          ...this.buildBaseViewModel(webApi.name, webApi.endpointPath, diag, null, root, scenario),
          webApi,
          details,
          selected,
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

import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { AsyncPipe } from '@angular/common';
import { Component, HostBinding, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, map, share } from 'rxjs';
import { GoToDevRest } from '..';
import { transient } from '../../../../../core';
import { PipelinesService } from '../../app-administration/services';
import { PermissionsService } from '../../permissions';
import { eavConstants } from '../../shared/constants/eav.constants';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { Context } from '../../shared/services/context';
import { DevRestBase } from '../dev-rest-base';
import { DevRestUrlsAndCodeComponent } from '../dev-rest-urls-and-code/dev-rest-urls-and-code';
import { SelectorWithHelpComponent } from '../selector-with-help/selector-with-help';
import { DevRestTabExamplesComponent } from '../tab-examples/tab-examples';
import { DevRestHttpHeadersComponent } from '../tab-headers/tab-headers';
import { DevRestTabIntroductionComponent } from '../tab-introduction/tab-introduction';
import { DevRestTabPermissionsComponent } from '../tab-permissions/tab-permissions';
import { DevRestQueryIntroductionComponent } from './introduction/introduction';
import { generateQueryCalls } from './query-samples';
import { DevRestQueryModel } from './query-template-vars';

const pathToQuery = 'app/{appname}/query/{queryname}';
@Component({
  selector: 'app-dev-rest-query',
  templateUrl: './query.html',
  styleUrls: ['./query.scss'],
  imports: [
    MatButtonModule,
    TippyDirective,
    MatIconModule,
    RouterOutlet,
    SelectorWithHelpComponent,
    MatProgressSpinnerModule,
    MatTabsModule,
    DevRestQueryIntroductionComponent,
    DevRestTabIntroductionComponent,
    DevRestTabExamplesComponent,
    MatFormFieldModule,
    MatInputModule,
    DevRestUrlsAndCodeComponent,
    DevRestTabPermissionsComponent,
    DevRestHttpHeadersComponent,
    AsyncPipe,
  ]
})
export class DevRestQueryComponent extends DevRestBase<DevRestQueryModel> implements OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  /** Test values for url params */
  urlParams$ = new BehaviorSubject<string>('');

  /** Test values for stream names */
  streamNames$ = new BehaviorSubject<string>('Default');

  /** This is necessary, because the Query-Rest can still be opened from the Visual-Query as a dialog */
  isSideNavContent: boolean;

  #pipelinesService = transient(PipelinesService);

  constructor(
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    context: Context,
    dialog: MatDialogRef<DevRestQueryComponent>,
    router: Router,
    route: ActivatedRoute,
    dnnContext: DnnContext,
  ) {
    const permissionsService = transient(PermissionsService);

    super(context, dialog, dnnContext, router, route, permissionsService);

    this.isSideNavContent = this.router.url.includes(GoToDevRest.routeQuery);

    // build Query Stream
    const query$ = combineLatest([
      route.paramMap.pipe(map(pm => pm.get(GoToDevRest.paramQuery))),
      this.#pipelinesService.getAll(eavConstants.contentTypes.query).pipe(share()),
    ]).pipe(
      map(([queryGuid, all]) => all.find(q => q.Guid === queryGuid)),
      share()
    );

    this.permissions$ = this.buildPermissionStream(GoToDevRest.paramQuery);

    // Build Root Stream (for the root folder)
    const root$ = combineLatest([query$, this.scenario$, this.dialogSettings$]).pipe(
      map(([query, scenario, dialogSettings]) => {
        const resolved = pathToQuery
          .replace('{queryname}', query.Name)
          .replace('{appname}', scenario.inSameContext ? 'auto' : encodeURI(dialogSettings.Context.App.Folder));
        return this.rootBasedOnScenario(resolved, scenario);
      }),
    );

    // build variables for template
    this.viewModel$ = combineLatest([
      combineLatest([query$, this.scenario$, this.permissions$]),
      combineLatest([root$, /* itemOfThisType$, */ this.dialogSettings$]),
      combineLatest([this.streamNames$, this.urlParams$])
    ]).pipe(
      map(([[query, scenario, permissions], [root, diag], [streamNames, urlParams]]) => ({
        ...this.buildBaseViewModel(query.Name, query.Guid, diag, permissions, root, scenario),
        query,
        apiCalls: generateQueryCalls(dnnContext.$2sxc, scenario, context, root, 0 /* #todoquery */, streamNames, urlParams),
      })),
    );
  }

  updateStreams(event: Event) {
    this.streamNames$.next((event.target as HTMLInputElement).value);
  }
  updateParams(event: Event) {
    this.urlParams$.next((event.target as HTMLInputElement).value);
  }

}

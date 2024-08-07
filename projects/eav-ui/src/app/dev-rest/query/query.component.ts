import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { Component, HostBinding, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, map, share } from 'rxjs';
import { GoToDevRest } from '..';
import { AppDialogConfigService, PipelinesService } from '../../app-administration/services';
import { MetadataService, PermissionsService } from '../../permissions';
import { eavConstants } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';
import { DevRestBase } from '../dev-rest-base.component';
import { generateQueryCalls } from './query-samples';
import { DevRestQueryViewModel } from './query-template-vars';
import { AsyncPipe } from '@angular/common';
import { DevRestHttpHeadersComponent } from '../tab-headers/tab-headers.component';
import { DevRestTabPermissionsComponent } from '../tab-permissions/tab-permissions.component';
import { DevRestUrlsAndCodeComponent } from '../dev-rest-urls-and-code/dev-rest-urls-and-code.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DevRestTabExamplesComponent } from '../tab-examples/tab-examples.component';
import { DevRestTabIntroductionComponent } from '../tab-introduction/tab-introduction.component';
import { DevRestQueryIntroductionComponent } from './introduction/introduction.component';
import { MatTabsModule } from '@angular/material/tabs';
import { SelectorWithHelpComponent } from '../selector-with-help/selector-with-help.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EntitiesService } from '../../content-items/services/entities.service';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { DialogService } from '../../shared/services/dialog.service';
import { transient } from '../../core';

const pathToQuery = 'app/{appname}/query/{queryname}';

@Component({
    selector: 'app-dev-rest-query',
    templateUrl: './query.component.html',
    styleUrls: [/*'./query.component.scss',*/ '../dev-rest-all.scss'],
    standalone: true,
    imports: [
        MatButtonModule,
        TippyDirective,
        MatIconModule,
        RouterOutlet,
        SelectorWithHelpComponent,
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
    ],
    providers: [
      PermissionsService,
      EntitiesService,
      AppDialogConfigService,
      // PipelinesService,
      MetadataService,
    ],
})
export class DevRestQueryComponent extends DevRestBase<DevRestQueryViewModel> implements OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private pipelinesService = transient(PipelinesService);

  /** Test values for url params */
  urlParams$ = new BehaviorSubject<string>('');

  /** Test values for stream names */
  streamNames$ = new BehaviorSubject<string>('Default');

  /** This is necessary, because the Query-Rest can still be opened from the Visual-Query as a dialog */
  isSideNavContent: boolean;

  constructor(
    appDialogConfigService: AppDialogConfigService,
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    context: Context,
    dialogRef: MatDialogRef<DevRestQueryComponent>,
    router: Router,
    route: ActivatedRoute,
    permissionsService: PermissionsService,
    dnnContext: DnnContext,
    // pipelinesService: PipelinesService,
  ) {
    super(appDialogConfigService, context, dialogRef, dnnContext, router, route, permissionsService);

    this.isSideNavContent = this.router.url.includes(GoToDevRest.routeQuery);

    // build Query Stream
    const query$ = combineLatest([
      route.paramMap.pipe(map(pm => pm.get(GoToDevRest.paramQuery))),
     this.pipelinesService.getAll(eavConstants.contentTypes.query).pipe(share()),
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

import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { Component, HostBinding, Input, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, share, switchMap } from 'rxjs';
import { generateApiCalls } from '..';
import { AppDialogConfigService, ContentTypesService } from '../../app-administration/services';
import { EavService, EntityService, QueryService } from '../../edit/shared/services';
import { PermissionsService } from '../../permissions';
import { Context } from '../../shared/services/context';
import { DevRestBase } from '../dev-rest-base.component';
import { GoToDevRest } from '../go-to-dev-rest';
import { DevRestDataViewModel } from './data-template-vars';
import { AsyncPipe } from '@angular/common';
import { DevRestHttpHeadersComponent } from '../tab-headers/tab-headers.component';
import { DevRestTabPermissionsComponent } from '../tab-permissions/tab-permissions.component';
import { DevRestUrlsAndCodeComponent } from '../dev-rest-urls-and-code/dev-rest-urls-and-code.component';
import { DevRestTabExamplesComponent } from '../tab-examples/tab-examples.component';
import { DevRestTabIntroductionComponent } from '../tab-introduction/tab-introduction.component';
import { DevRestDataIntroductionComponent } from './introduction/introduction.component';
import { MatTabsModule } from '@angular/material/tabs';
import { SelectorWithHelpComponent } from '../selector-with-help/selector-with-help.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EntitiesService } from '../../content-items/services/entities.service';
import { TippyStandaloneDirective } from '../../shared/directives/tippy-Standalone.directive';
import { ContentType } from '../../app-administration/models';
import { EntityBasic } from '../../edit/shared/models/entity-basic';

const pathToContent = 'app/{appname}/data/{typename}';

@Component({
  selector: 'app-dev-rest-data',
  templateUrl: './data.component.html',
  styleUrls: ['../dev-rest-all.scss'],
  // we need preserve whitespace - otherwise spaces are missing in some conditional HTML
  preserveWhitespaces: true,
  standalone: true,
  imports: [
    MatButtonModule,
    TippyStandaloneDirective,
    MatIconModule,
    RouterOutlet,
    SelectorWithHelpComponent,
    MatTabsModule,
    DevRestDataIntroductionComponent,
    DevRestTabIntroductionComponent,
    DevRestTabExamplesComponent,
    DevRestUrlsAndCodeComponent,
    DevRestTabPermissionsComponent,
    DevRestHttpHeadersComponent,
    AsyncPipe,
  ],
  providers: [
    PermissionsService,
    EntitiesService,
    EntityService,
    AppDialogConfigService,
    ContentTypesService,
    EavService,
    // WIP - should be self-declared by the EntitiesService
    QueryService,
  ],
})
export class DevRestDataComponent extends DevRestBase<DevRestDataViewModel> implements OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  @Input() contentTypeInput$: BehaviorSubject<ContentType>;

  // wip - probably no use case where it's a dialog
  // isSideNavContent: boolean;

  constructor(
    dialogRef: MatDialogRef<DevRestDataComponent>,
    router: Router,
    route: ActivatedRoute,
    contentTypesService: ContentTypesService,
    appDialogConfigService: AppDialogConfigService,
    permissionsService: PermissionsService,
    entityService: EntityService,
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    context: Context,
    /** sxc-angular context. Used to resolve urls */
    dnnContext: DnnContext,
  ) {
    super(appDialogConfigService, context, dialogRef, dnnContext, router, route, permissionsService);
    // this.isSideNavContent = this.router.url.includes(GoToDevRest.routeData);

    const contentType$ = route.paramMap.pipe(
      map(pm => pm.get(GoToDevRest.paramTypeName)),
      switchMap(ctName => contentTypesService.retrieveContentType(ctName)),
      share()
    );

    // Build Dialog Settings Stream
    // Note: this is probably already loaded somewhere, so I'm not sure why we're getting it again
    // const dialogSettings$ = appDialogConfigService.getDialogSettings().pipe(share());

    this.permissions$ = this.buildPermissionStream(GoToDevRest.paramTypeName);

    // Build Root Stream (for the root folder)
    const root$ = combineLatest([contentType$, this.scenario$, this.dialogSettings$]).pipe(
      map(([contentType, scenario, dialogSettings]) => {
        const resolved = pathToContent
          .replace('{typename}', contentType.Name)
          .replace('{appname}', scenario.inSameContext ? 'auto' : encodeURI(dialogSettings.Context.App.Folder));
        return this.rootBasedOnScenario(resolved, scenario);
      }),
    );

    // Get an item of this type for building urls
    const noDataFound: EntityBasic = { Id: 0, Guid: '00000000-0000-0000-0000-000000000000', Title: 'no data found' };
    const itemOfThisType$ = entityService.reactiveEntities(
      contentType$.pipe(
        filter(ct => !!ct),
        map(ct => ({ contentTypeName: ct.StaticName })),
      ),
    ).pipe(
      map(list => list.length
        ? list[0]
        // we need a dummy in case nothing is found, otherwise the observables stop
        : noDataFound),
    );

    // Prepare everything for use in the template
    // Note that we need to mix multiple combineLatest, because a combineLatest can only take 6 streams
    this.viewModel$ = combineLatest([
      combineLatest([
        contentType$,
        this.scenario$,
        this.permissions$
      ]),
      combineLatest([
        root$,
        itemOfThisType$,
        this.dialogSettings$
      ]),
    ]).pipe(
      map(([[contentType, scenario, permissions], [root, item, diag]]) => {
        var result: DevRestDataViewModel = {
        // return ({
          ...this.buildBaseViewModel(contentType.Name, contentType.StaticName, diag, permissions, root, scenario),
          contentType,
          itemId: item.Id,
          // 2024-04-26 2dm - believe this is never used, so removed it #cleanup-picker
          // itemGuid: item.Guid, //Value,
          apiCalls: generateApiCalls(dnnContext.$2sxc, scenario, context, root, item.Id),
        };//);
        return result;
      }),
    );

  }

}

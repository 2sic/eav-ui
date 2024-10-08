import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { AsyncPipe } from '@angular/common';
import { Component, HostBinding, Input, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, share, switchMap } from 'rxjs';
import { generateApiCalls } from '..';
import { transient } from '../../../../../core';
import { EntityLightIdentifier } from '../../../../../edit-types/src/EntityLight';
import { ContentType } from '../../app-administration/models';
import { ContentTypesService } from '../../app-administration/services';
import { PermissionsService } from '../../permissions';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { Context } from '../../shared/services/context';
import { EntityService } from '../../shared/services/entity.service';
import { DevRestBase } from '../dev-rest-base.component';
import { DevRestUrlsAndCodeComponent } from '../dev-rest-urls-and-code/dev-rest-urls-and-code.component';
import { GoToDevRest } from '../go-to-dev-rest';
import { SelectorWithHelpComponent } from '../selector-with-help/selector-with-help.component';
import { DevRestTabExamplesComponent } from '../tab-examples/tab-examples.component';
import { DevRestHttpHeadersComponent } from '../tab-headers/tab-headers.component';
import { DevRestTabIntroductionComponent } from '../tab-introduction/tab-introduction.component';
import { DevRestTabPermissionsComponent } from '../tab-permissions/tab-permissions.component';
import { DevRestDataViewModel } from './data-template-vars';
import { DevRestDataIntroductionComponent } from './introduction/introduction.component';


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
    TippyDirective,
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
})
export class DevRestDataComponent extends DevRestBase<DevRestDataViewModel> implements OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';
  @Input() contentTypeInput$: BehaviorSubject<ContentType>;

  private entityService = transient(EntityService);
  private contentTypesService = transient(ContentTypesService);


  constructor(
    dialog: MatDialogRef<DevRestDataComponent>,
    router: Router,
    route: ActivatedRoute,

    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    context: Context,
    /** sxc-angular context. Used to resolve urls */
    dnnContext: DnnContext,
  ) {
    const permissionsService = transient(PermissionsService);
    super(context, dialog, dnnContext, router, route, permissionsService);

    const contentType$ = route.paramMap.pipe(
      map(pm => pm.get(GoToDevRest.paramTypeName)),
      switchMap(ctName => this.contentTypesService.retrieveContentType(ctName)),
      share()
    );

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
    const noDataFound: EntityLightIdentifier = { Id: 0, Guid: '00000000-0000-0000-0000-000000000000', Title: 'no data found' };
    const itemOfThisType$ = this.entityService.getEntities$(
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
    this.viewModel$ = combineLatest([
        contentType$,
        this.scenario$,
        this.permissions$,
        root$,
        itemOfThisType$,
        this.dialogSettings$
    ]).pipe(
      map(([contentType, scenario, permissions, root, item, diag]) => {
        var result: DevRestDataViewModel = {
          ...this.buildBaseViewModel(contentType.Name, contentType.StaticName, diag, permissions, root, scenario),
          contentType,
          itemId: item.Id,
          apiCalls: generateApiCalls(dnnContext.$2sxc, scenario, context, root, item.Id),
        };
        return result;
      }),
    );

  }

}

import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, share, switchMap } from 'rxjs/operators';
import { generateApiCalls } from '..';
import { EntityService } from '../../../../../edit/shared/services';
import { AppDialogConfigService, ContentTypesService } from '../../app-administration/services';
import { PermissionsService } from '../../permissions';
import { Context } from '../../shared/services/context';
import { DevRestBase } from '../dev-rest-base.component';
import { GoToDevRest } from '../go-to-dev-rest';
import { DevRestDataTemplateVars } from './dev-rest-data-template-vars';

const pathToContent = 'app/{appname}/content/{typename}';

@Component({
  selector: 'app-dev-rest-data',
  templateUrl: './dev-rest-data.component.html',
  styleUrls: ['../dev-rest-all.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // we need preserve whitespace - otherwise spaces are missing in some conditional HTML
  preserveWhitespaces: true,
})
export class DevRestDataComponent extends DevRestBase implements OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  /** Template variables for the HTML template */
  templateVars$: Observable<DevRestDataTemplateVars>;

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
    /** dnn-sxc-angular context. Used to resolve urls */
    dnnContext: DnnContext,
  ) {
    super(appDialogConfigService, context, dialogRef, dnnContext, router, route, permissionsService);

    // Build ContentType Stream
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
    const itemOfThisType$ = entityService.reactiveEntities(
      contentType$.pipe(
        filter(ct => !!ct),
        map(ct => ({ contentTypeName: ct.StaticName })),
      ),
    ).pipe(
      map(list => list.length ? list[0] : null),
      filter(i => !!i),
    );

    // Prepare everything for use in the template
    // Note that we need to mix multiple combineLatest, because a combineLatest can only take 6 streams
    this.templateVars$ = combineLatest([
      combineLatest([contentType$, this.scenario$, this.permissions$]),
      combineLatest([root$, itemOfThisType$, this.dialogSettings$]),
    ]).pipe(
      map(([[contentType, scenario, permissions], [root, item, diag]]) => ({
        ...this.buildBaseTemplateVars(contentType.Name, diag, permissions, root, scenario),
        contentType,
        // currentScenario: scenario,
        // root,
        itemId: item.Id,
        itemGuid: item.Value,
        apiCalls: generateApiCalls(dnnContext.$2sxc, scenario, context, root, item.Id),
        // folder: encodeURI(diag.Context.App.Folder),
        // moduleId: context.moduleId,
        // scenario,
        // permissions,
        // permissionsHasAnonymous: permissions.filter(p => p.Condition.indexOf('.Anonymous') > 0).length > 0,
      })),
    );

  }



}

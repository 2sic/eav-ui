import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { generateQueryCalls, GoToDevRest } from '..';
import { AppDialogConfigService, PipelinesService } from '../../app-administration/services';
import { PermissionsService } from '../../permissions';
import { eavConstants } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';
import { DevRestBase } from '../dev-rest-base.component';
import { DevRestQueryTemplateVars } from './dev-rest-query-template-vars';

const pathToQuery = 'app/{appname}/query/{queryname}';

// #todoquery
// - get permissions to work
// - samples in code
// - help-link to docs (in query and data)
// - link to this from VisualQuery designer

@Component({
  selector: 'app-dev-rest-query',
  templateUrl: './dev-rest-query.component.html',
  styleUrls: ['../dev-rest-all.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevRestQueryComponent extends DevRestBase implements OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  templateVars$: Observable<DevRestQueryTemplateVars>;

  constructor(
    appDialogConfigService: AppDialogConfigService,
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    context: Context,
    dialogRef: MatDialogRef<DevRestQueryComponent>,
    router: Router,
    route: ActivatedRoute,
    pipelinesService: PipelinesService,
    permissionsService: PermissionsService,
    dnnContext: DnnContext,
  ) {

    super(appDialogConfigService, context, dialogRef, dnnContext, router, route, permissionsService);

    // build Query Stream
    const query$ = combineLatest([
      route.paramMap.pipe(map(pm => pm.get(GoToDevRest.paramQuery))),
      pipelinesService.getAll(eavConstants.contentTypes.query).pipe(share()),
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
    this.templateVars$ = combineLatest([
      combineLatest([query$, this.scenario$, this.permissions$]),
      combineLatest([root$, /* itemOfThisType$, */ this.dialogSettings$]),
    ]).pipe(
      map(([[query, scenario, permissions], [root, diag]]) => ({
        ...this.buildBaseTemplateVars(query.Name, diag, permissions, root, scenario),
        query,
        apiCalls: generateQueryCalls(dnnContext.$2sxc, scenario, context, root, 0 /* #todoquery */ ),
      })),
    );
  }

}

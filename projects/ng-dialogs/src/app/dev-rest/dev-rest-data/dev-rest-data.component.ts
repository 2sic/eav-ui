import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EntityService } from 'projects/edit';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map, pairwise, share, startWith, switchMap } from 'rxjs/operators';
import { AllScenarios, generateApiCalls, Scenario } from '..';
import { AppDialogConfigService } from '../../app-administration/services/app-dialog-config.service';
import { ContentTypesService } from '../../app-administration/services/content-types.service';
import { PermissionsService } from '../../permissions/services/permissions.service';
import { eavConstants } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';
import { DevRestNavigation } from '../dev-rest-navigation';
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
export class DevRestDataComponent implements OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  /** Template variables for the HTML template */
  templateVars$: Observable<DevRestDataTemplateVars>;

  /** List of scenarios */
  scenarios = AllScenarios;

  /** Currently selected scenario */
  private scenario$ = new BehaviorSubject<Scenario>(AllScenarios[0]);

  /** Subscription Sink */
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<DevRestDataComponent>,
    private router: Router,
    private route: ActivatedRoute,
    contentTypesService: ContentTypesService,
    appDialogConfigService: AppDialogConfigService,
    permissionsService: PermissionsService,
    entityService: EntityService,
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    context: Context,
    /** dnn-sxc-angular context. Used to resolve urls */
    dnnContext: DnnContext,
  ) {

    // Build ContentType Stream
    const contentType$ = route.paramMap.pipe(
      map(pm => pm.get(DevRestNavigation.paramTypeName)),
      switchMap(ctName => contentTypesService.retrieveContentType(ctName)),
      share()
    );

    // Build Dialog Settings Stream
    // Note: this is probably already loaded somewhere, so I'm not sure why we're getting it again
    const dialogSettings$ = appDialogConfigService.getDialogSettings().pipe(share());

    // This observable fires when a sub-dialog was openend and closed again
    const fireOnStartAndWhenSubDialogCloses = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(!!this.route.snapshot.firstChild),
      map(() => !!this.route.snapshot.firstChild),
      pairwise(),
      filter(([prevHadChild, newHasChild]) => prevHadChild && !newHasChild),
      startWith([]), // this ensures it fires once in the beginning
    );

    // Build Permissions Stream
    const permissions$ = combineLatest([
      fireOnStartAndWhenSubDialogCloses,
      route.paramMap.pipe(map(pm => pm.get(DevRestNavigation.paramTypeName))),
    ]).pipe(
      switchMap(([_, typeName])  => {
        // TODO: 2dm - something looks wrong here, we're getting Entity-metadata for content-type!
        return permissionsService.getAll(eavConstants.metadata.entity.type, eavConstants.keyTypes.guid, typeName);
      }),
      share()
    );

    // Build Root Stream (for the root folder)
    const root$ = combineLatest([contentType$, this.scenario$, dialogSettings$]).pipe(
      map(([contentType, scenario, dialogSettings]) => {
        const resolved = pathToContent
          .replace('{typename}', contentType.Name)
          .replace('{appname}', scenario.inSameContext ? 'auto' : encodeURI(dialogSettings.Context.App.Folder));
        const domainPrefix = document.location.protocol + '//' + document.location.host;
        return scenario.useVirtual
          ? resolved
          : (scenario.inSameSite ? '' : domainPrefix) + dnnContext.$2sxc.http.apiUrl(resolved);
      }),
    );

    // Get an item of this type for building urls
    const itemOfThisType$ = entityService.reactiveEntities(
      contentType$.pipe(filter(ct => !!ct), map(ct => ({ contentTypeName: ct.StaticName, filter: '' })))
    ).pipe(
      map(list => list.length ? list[0] : null),
      filter(i => !!i)
    );

    // Prepare everything for use in the template
    // Note that we need to mix multiple combineLatest, because a combineLatest can only take 6 streams
    this.templateVars$ = combineLatest([
      combineLatest([contentType$, this.scenario$, permissions$]),
      combineLatest([root$, itemOfThisType$, dialogSettings$]),
    ]).pipe(
      map(([[contentType, scenario, permissions], [root, item, diag]]) => ({
        contentType,
        currentScenario: scenario,
        root,
        itemId: item.Id,
        itemGuid: item.Value,
        apiCalls: generateApiCalls(dnnContext.$2sxc, scenario, context, root, item.Id),
        folder: encodeURI(diag.Context.App.Folder),
        moduleId: context.moduleId,
        scenario,
        permissions,
        permissionsHasAnonymous: permissions.filter(p => p.Condition.indexOf('.Anonymous') > 0).length > 0,
      })),
    );

  }

  ngOnDestroy() {
    this.scenario$.complete();
    this.subscription.unsubscribe();
  }

  changeScenario(scenario: Scenario) {
    this.scenario$.next(scenario);
  }

  closeDialog() {
    this.dialogRef.close();
  }

}

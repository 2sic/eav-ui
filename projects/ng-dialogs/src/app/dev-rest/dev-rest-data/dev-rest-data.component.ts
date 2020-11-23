import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EntityService } from 'projects/edit';
import { EntityInfo } from 'projects/edit/shared/models/eav/entity-info';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { AllScenarios, generateApiCalls, Scenario } from '..';
import { ContentType } from '../../app-administration/models/content-type.model';
import { DialogSettings } from '../../app-administration/models/dialog-settings.model';
import { AppDialogConfigService } from '../../app-administration/services/app-dialog-config.service';
import { ContentTypesService } from '../../app-administration/services/content-types.service';
import { Permission } from '../../permissions/models/permission.model';
import { PermissionsService } from '../../permissions/services/permissions.service';
import { eavConstants } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';
import { DevRestTemplateVars } from './dev-rest-template-vars';

const pathToContent = 'app/{appname}/content/{typename}';

@Component({
  selector: 'app-dev-rest-data',
  templateUrl: './dev-rest-data.component.html',
  styleUrls: ['../dev-rest-all.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // we need preserve whitespace, as many conditional parts are put together, and then spaces are missing between them
  preserveWhitespaces: true,
})
export class DevRestDataComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  /** List of scenarios */
  scenarios = AllScenarios;

  templateVars$: Observable<DevRestTemplateVars>;

  private targetType = eavConstants.metadata.entity.type;
  private keyType = eavConstants.keyTypes.guid;
  private contentTypeStaticName = this.route.snapshot.parent.paramMap.get('contentTypeStaticName');

  /** Content Type to show REST infos about */
  private contentType$: BehaviorSubject<ContentType>;

  /** App, language, etc. */
  private dialogSettings$: BehaviorSubject<DialogSettings>;

  private permissions$ = new Subject<Permission[]>();

  /** Currently selected scenario */
  private scenario$: BehaviorSubject<Scenario>;

  private modeInternal$: Observable<boolean>;

  private itemOfThisType$: Observable<EntityInfo>;

  /** The root path for the current request */
  private root$: Observable<string>;

  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<DevRestDataComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
    private appDialogConfigService: AppDialogConfigService,
    private permissionsService: PermissionsService,
    entityService: EntityService,
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    context: Context,
    /** dnn-sxc-angular context. Used to resolve urls */
    dnnContext: DnnContext,
  ) {
    this.contentType$ = new BehaviorSubject<ContentType>(null);
    this.dialogSettings$ = new BehaviorSubject<DialogSettings>(null);
    this.scenario$ = new BehaviorSubject<Scenario>(this.scenarios[0]);
    this.modeInternal$ = this.scenario$.pipe(map(scenario => scenario.key === 'internal'));

    this.root$ = combineLatest([this.contentType$, this.scenario$, this.dialogSettings$]).pipe(
      map(([contentType, scenario, dialogSettings]) => {
        if (contentType == null || dialogSettings == null) { return ''; }

        // const internal = scenario === AllScenarios[0];
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
    this.itemOfThisType$ = entityService.reactiveEntities(
      this.contentType$.pipe(filter(ct => !!ct), map(ct => ({ contentTypeName: ct.StaticName, filter: '' })))
    ).pipe(map(list => list.length ? list[0] : null), filter(i => !!i));

    // we need to mix 2 combineLatest, because a combineLatest can only take 6 streams
    this.templateVars$ = combineLatest([
      combineLatest([this.contentType$, this.scenario$, this.modeInternal$]),
      combineLatest([this.root$, this.itemOfThisType$, this.dialogSettings$.pipe(filter(d => !!d))]),
      combineLatest([this.permissions$]),
    ]).pipe(
      map(([[contentType, scenario, modeInternal], [root, item, diag], [permissions]]) => ({
        contentType,
        currentScenario: scenario,
        modeInternal,
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

  ngOnInit() {
    this.fetchData();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.contentType$.complete();
    this.dialogSettings$.complete();
    this.permissions$.complete();
    this.scenario$.complete();
    this.subscription.unsubscribe();
  }

  changeScenario(scenario: Scenario) {
    this.scenario$.next(scenario);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private fetchData() {
    this.contentTypesService.retrieveContentType(this.contentTypeStaticName).subscribe(contentType => {
      this.contentType$.next(contentType);
    });
    this.appDialogConfigService.getDialogSettings().subscribe(dialogSettings => {
      this.dialogSettings$.next(dialogSettings);
    });
    this.permissionsService.getAll(this.targetType, this.keyType, this.contentTypeStaticName).subscribe(permissions => {
      this.permissions$.next(permissions);
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild),
        map(() => !!this.route.snapshot.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchData();
      })
    );
  }

}

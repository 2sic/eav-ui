import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { EntityService } from 'projects/edit';
import { EntityInfo } from 'projects/edit/shared/models/eav/entity-info';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AllScenarios, ApiCall, generateApiCalls, Scenario } from '.';
import { ContentType } from '../app-administration/models/content-type.model';
import { DialogSettings } from '../app-administration/models/dialog-settings.model';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { Context } from '../shared/services/context';

const pathToContent = 'app/{appname}/content/{typename}';

@Component({
  selector: 'app-dev-rest',
  templateUrl: './dev-rest.component.html',
  styleUrls: ['./dev-rest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevRestComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component dialog-component--no-actions';

  /** List of scenarios */
  scenarios = AllScenarios;

  templateVars$: Observable<{
    contentType: ContentType;
    scenario: Scenario;
    modeInternal: boolean;
    root: string;
    itemId: number,
    itemGuid: string,
    apiCalls: ApiCall[],
    folder: string,
    moduleId: number,
  }>;

  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');

  /** Content Type to show REST infos about */
  private contentType$: BehaviorSubject<ContentType>;

  /** App, language, etc. */
  private dialogSettings$: BehaviorSubject<DialogSettings>;

  /** Currently selected scenario */
  private scenario$: BehaviorSubject<Scenario>;

  private modeInternal$: Observable<boolean>;

  private itemOfThisType$: Observable<EntityInfo>;

  /** The root path for the current request */
  private root$: Observable<string>;

  constructor(
    private dialogRef: MatDialogRef<DevRestComponent>,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private contentTypesService: ContentTypesService,
    private appDialogConfigService: AppDialogConfigService,
    private entityService: EntityService,
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    private context: Context,
    /** dnn-sxc-angular context. Used to resolve urls */
    private dnnContext: DnnContext,
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
      this.contentType$.pipe(filter(ct => !!ct), map(ct => ({ contentTypeName: ct.StaticName, filter: ''}))))
      .pipe(map(list => list.length ? list[0] : null), filter(i => !!i));

    // we need to mix 2 combineLatest, because a combinelatest can only take 6 streams
    const combineForUi2 = combineLatest([
      this.root$,
      this.itemOfThisType$,
      this.dialogSettings$.pipe(filter(d => !!d)),
    ]);
    this.templateVars$ = combineLatest([
      combineLatest([this.contentType$, this.scenario$, this.modeInternal$]),
      combineForUi2,
    ]).pipe(
      map(([[contentType, scenario, modeInternal], [root, item, diag]]) => ({
        contentType,
        currentScenario: scenario,
        modeInternal,
        root,
        itemId: item.Id,
        itemGuid: item.Value,
        // todo: SPM - why can't I get the module id here using dnnContext.moduleId
        apiCalls: generateApiCalls(scenario, context.moduleId, root, item.Id),
        folder: encodeURI(diag.Context.App.Folder),
        moduleId: context.moduleId,
        scenario,
      })),
    );

  }

  ngOnInit() {
    this.contentTypesService.retrieveContentType(this.contentTypeStaticName).subscribe(this.contentType$);
    this.appDialogConfigService.getDialogSettings().subscribe(this.dialogSettings$);
  }

  ngOnDestroy() {
    this.contentType$.complete();
    this.dialogSettings$.complete();
    this.scenario$.complete();
  }

  changeScenario(scenario: Scenario) {
    this.scenario$.next(scenario);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  // todo: 2dm - probably open a dialog showing the results etc.
  callApiGet(url: string) {
    this.http.get<any>(url).subscribe(res => {
      console.log(`Called ${url} and got this:`, res);
      this.openSnackBar(`Called ${url}. You can see the full result in the F12 console`, 'API call returned');
    });
    this.openSnackBar(`Calling ${url}. You can see the full result in the F12 console`, 'API call sent');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}

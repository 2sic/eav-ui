import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { EntityService } from 'projects/edit';
import { EntityInfo } from 'projects/edit/shared/models/eav/entity-info';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AllScenarios, generateApiCalls, Scenario } from '.';
import { ContentType } from '../app-administration/models/content-type.model';
import { DialogSettings } from '../app-administration/models/dialog-settings.model';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { Permission } from '../permissions/models/permission.model';
import { PermissionsService } from '../permissions/services/permissions.service';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants } from '../shared/constants/eav.constants';
import { copyToClipboard } from '../shared/helpers/copy-to-clipboard.helper';
import { Context } from '../shared/services/context';
import { DevRestTemplateVars } from './dev-rest.models';

const pathToContent = 'app/{appname}/content/{typename}';

@Component({
  selector: 'app-dev-rest',
  templateUrl: './dev-rest.component.html',
  styleUrls: ['./dev-rest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // we need preserve whitespace, as many conditional parts are put together, and then spaces are missing between them
  preserveWhitespaces: true,
})
export class DevRestComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  /** AgGrid modules */
  modules = AllCommunityModules;
  /** AgGrid options */
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    columnDefs: [
      { headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'no-padding no-outline' },
      { headerName: 'Name', field: 'Title', flex: 2, minWidth: 250, cellClass: 'no-outline' },
      { headerName: 'Identity', field: 'Identity', flex: 2, minWidth: 250, cellClass: 'no-outline' },
      { headerName: 'Condition', field: 'Condition', flex: 2, minWidth: 250, cellClass: 'no-outline' },
      { headerName: 'Grant', field: 'Grant', width: 70, headerClass: 'dense', cellClass: 'no-outline' },
    ],
  };

  /** List of scenarios */
  scenarios = AllScenarios;

  templateVars$: Observable<DevRestTemplateVars>;

  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');

  /** Content Type to show REST infos about */
  private contentType$: BehaviorSubject<ContentType>;

  /** App, language, etc. */
  private dialogSettings$: BehaviorSubject<DialogSettings>;

  private permissions$: BehaviorSubject<Permission[]>;

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
    private permissionsService: PermissionsService,
    entityService: EntityService,
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    context: Context,
    /** dnn-sxc-angular context. Used to resolve urls */
    dnnContext: DnnContext,
  ) {
    this.contentType$ = new BehaviorSubject<ContentType>(null);
    this.dialogSettings$ = new BehaviorSubject<DialogSettings>(null);
    this.permissions$ = new BehaviorSubject<Permission[]>(null);
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

    // we need to mix 2 combineLatest, because a combinelatest can only take 6 streams
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
        apiCalls: generateApiCalls(dnnContext.$2sxc, scenario, context.moduleId, root, item.Id),
        folder: encodeURI(diag.Context.App.Folder),
        moduleId: context.moduleId,
        scenario,
        permissions,
      })),
    );

  }

  ngOnInit() {
    this.contentTypesService.retrieveContentType(this.contentTypeStaticName).subscribe(this.contentType$);
    this.appDialogConfigService.getDialogSettings().subscribe(this.dialogSettings$);

    const targetType = eavConstants.metadata.entity.type;
    const keyType = eavConstants.keyTypes.guid;
    const key = this.contentTypeStaticName;
    this.permissionsService.getAll(targetType, keyType, key).subscribe(this.permissions$);
  }

  ngOnDestroy() {
    this.contentType$.complete();
    this.dialogSettings$.complete();
    this.permissions$.complete();
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

  copyCode(text: string) {
    copyToClipboard(text);
    this.openSnackBar('Copied to clipboard');
  }

  private openSnackBar(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}

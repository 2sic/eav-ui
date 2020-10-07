import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccessScenarios, Environments, EnvironmentSelectorData, SelectorData } from '.';
import { ContentType } from '../app-administration/models/content-type.model';
import { DialogSettings } from '../app-administration/models/dialog-settings.model';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { Context } from '../shared/services/context';
import { ItemResult } from './dev-rest.models';

const pathToContent = 'app/{appname}/content/{typename}';

@Component({
  selector: 'app-dev-rest',
  templateUrl: './dev-rest.component.html',
  styleUrls: ['./dev-rest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevRestComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component dialog-component--no-actions';

  /** List of all known environments */
  environments = Environments;

  /** List of scenarios */
  scenarios = AccessScenarios;

  templateVars$: Observable<{
    contentType: ContentType;
    currentEnv: EnvironmentSelectorData;
    currentScenario: SelectorData;
    modeInternal: boolean;
    root: string;
  }>;

  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');

  /** Content Type to show REST infos about */
  private contentType$: BehaviorSubject<ContentType>;

  /** App, language, etc. */
  private dialogSettings$: BehaviorSubject<DialogSettings>;

  /** Currently selected environment object */
  private currentEnv$: BehaviorSubject<EnvironmentSelectorData>;

  /** Currently selected scenario */
  private currentScenario$: BehaviorSubject<SelectorData>;

  private modeInternal$: Observable<boolean>;

  /** The root path for the current request */
  private root$: Observable<string>;

  constructor(
    private dialogRef: MatDialogRef<DevRestComponent>,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private contentTypesService: ContentTypesService,
    private appDialogConfigService: AppDialogConfigService,
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    private context: Context,
    /** dnn-sxc-angular context. Used to resolve urls */
    private dnnContext: DnnContext,
  ) {
    this.contentType$ = new BehaviorSubject<ContentType>(null);
    this.dialogSettings$ = new BehaviorSubject<DialogSettings>(null);
    this.currentEnv$ = new BehaviorSubject<EnvironmentSelectorData>(this.environments[0]);
    this.currentScenario$ = new BehaviorSubject<SelectorData>(this.scenarios[0]);
    this.modeInternal$ = this.currentScenario$.pipe(map(scenario => scenario.key === 'internal'));

    this.root$ = combineLatest([this.contentType$, this.currentEnv$, this.currentScenario$, this.dialogSettings$]).pipe(
      map(([contentType, env, scenario, dialogSettings]) => {
        if (contentType == null || dialogSettings == null) { return ''; }

        const internal = scenario === AccessScenarios[0];
        const root = internal ? '' : env.rootPath;
        return root + pathToContent
          .replace('{typename}', contentType.Name)
          .replace('{appname}', internal ? 'auto' : dialogSettings.Context.App.Name);
      }),
    );

    this.templateVars$ = combineLatest([this.contentType$, this.currentEnv$, this.currentScenario$, this.modeInternal$, this.root$]).pipe(
      map(([contentType, currentEnv, currentScenario, modeInternal, root]) => ({
        contentType,
        currentEnv,
        currentScenario,
        modeInternal,
        root,
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
    this.currentEnv$.complete();
    this.currentScenario$.complete();
  }

  changeEnv(env: EnvironmentSelectorData) {
    this.currentEnv$.next(env);
  }

  changeScenario(scenario: SelectorData) {
    this.currentScenario$.next(scenario);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  // todo: 2dm - probably open a dialog showing the results etc.
  callApiGet(url: string) {
    this.http.get<ItemResult[]>(url).subscribe(res => {
      console.log(res);
    });
    this.openSnackBar('API call dispatched - to see it, you should have the console (F12) open.', 'API call');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}

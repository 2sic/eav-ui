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
import { AccessScenarios, Environments, EnvironmentSelectorData, SelectorData } from '.';
import { ContentType } from '../app-administration/models/content-type.model';
import { DialogSettings } from '../app-administration/models/dialog-settings.model';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { Context } from '../shared/services/context';
import { ItemResult } from './data/dev-rest.models';

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
    itemId: number,
    itemGuid: string,
    apiCalls: ApiCall[],
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
    this.currentEnv$ = new BehaviorSubject<EnvironmentSelectorData>(this.environments[0]);
    this.currentScenario$ = new BehaviorSubject<SelectorData>(this.scenarios[0]);
    this.modeInternal$ = this.currentScenario$.pipe(map(scenario => scenario.key === 'internal'));

    this.root$ = combineLatest([this.contentType$, this.currentScenario$, this.dialogSettings$]).pipe(
      map(([contentType, scenario, dialogSettings]) => {
        if (contentType == null || dialogSettings == null) { return ''; }

        const internal = scenario === AccessScenarios[0];
        const resolved = pathToContent
          .replace('{typename}', contentType.Name)
          .replace('{appname}', internal ? 'auto' : encodeURI(dialogSettings.Context.App.Folder));
        return internal ? resolved : dnnContext.$2sxc.http.apiUrl(resolved);
      }),
    );

    // Get an item of this type for building urls
    this.itemOfThisType$ = entityService.reactiveEntities(
      this.contentType$.pipe(filter(ct => !!ct), map(ct => ({ contentTypeName: ct.StaticName, filter: ''}))))
      .pipe(map(list => list.length ? list[0] : null), filter(i => !!i));

    this.templateVars$ = combineLatest([this.contentType$, this.currentEnv$, this.currentScenario$, this.modeInternal$,
      this.root$, this.itemOfThisType$]).pipe(
      map(([contentType, currentEnv, currentScenario, modeInternal, root, item]) => ({
        contentType,
        currentEnv,
        currentScenario,
        modeInternal,
        root,
        itemId: item.Id,
        itemGuid: item.Value,
        // todo: SPM - why can't I get the module id here using dnnContext.moduleId
        apiCalls: generateApiCalls(context.moduleId, root, item.Id),
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

class ApiCall {
  constructor(
    public virtual: boolean,
    public verb: 'GET' | 'POST' | 'DELETE',
    public url: string,
    public instructions: string,
    public enableButton: boolean,
    public code: CodeSample[] = [],
    ) {}
}

class CodeSample {
  constructor(
    public title: string,
    public code: string,
    public wrap = false,
    public runInConsole = false) {
  }
}

function generateApiCalls(moduleId: number, root: string, id: number) {
  const virtual = root[0] !== '/';
  root = root + '/';
  return [
    new ApiCall(virtual, 'GET', root, 'Read list of all items', true,
      createGetSnippets(root, moduleId)),
    new ApiCall(virtual, 'GET', root + id, 'Read a single item #' + id, true,
      createGetSnippets(root + id, moduleId)),
    new ApiCall(virtual, 'POST', root, 'Create an item', false),
    new ApiCall(virtual, 'POST', root + id, 'Update the item #' + id, false),
    new ApiCall(virtual, 'DELETE', root + id, 'Delete item #' + id, false)
  ];
}

function createGetSnippets(path: string, moduleId: number): CodeSample[] {
  return [
    new CodeSample('Example with global $2sxc and event-context',
      `<span onclick="$2sxc(this).webApi.get('${path}').then(data => console.log(data))">
  get it
</span>`),
    new CodeSample(`Example with global $2sxc and a Module-Id ${moduleId}`,
      `// get the sxc-controller for this module
var sxc = $2sxc(${moduleId});
// now get the data in the promise
sxc.webApi.get('${path}')
  .then(data => {
    console.log(data)
  });`),
    new CodeSample(`Same example as one-liner to run in the console`,
      `$2sxc(${moduleId}).webApi.get('${path}').then(data => console.log('just got:', data));`, true, true),
    new CodeSample('Example where you get the Module-Id from Razor',
      `// this will be replaced on the server with the ID
var moduleId = @Dnn.Module.ModuleID;
var sxc = $2sxc(moduleId);
var data = sxc.webApi.get('${path}');`),
  ];
}


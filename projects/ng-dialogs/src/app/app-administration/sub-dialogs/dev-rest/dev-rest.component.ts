import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, from, Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AccessScenarios, Environments, EnvironmentSelectorData, SelectorData, SelectorWithHelpComponent } from '../../../dev-rest';

const pathToContent = 'app/{appname}/content/{typename}';

@Component({
  selector: 'app-dev-rest',
  templateUrl: './dev-rest.component.html',
  styleUrls: ['./dev-rest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevRestComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostBinding('className') hostClass = 'dialog-component';
  @ViewChild('scenarioPicker') scenarioPicker: SelectorWithHelpComponent;
  @ViewChild('environmentPicker') envPicker: SelectorWithHelpComponent;

  contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');

  /** name of the type to show REST infos about */
  typeName$: Observable<string>;

  /** list of all known environments */
  environments = Environments;

  /** currently selected environment object */
  currentEnv: Observable<SelectorData>;

  /** list of scenarios */
  scenarios = AccessScenarios;

  /** currently selected scenario */
  currentScenario: Observable<SelectorData>;

  /** The root path for the current request */
  root$: Observable<string>;

  modeInternal = true;

  constructor(
    private dialogRef: MatDialogRef<DevRestComponent>,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {
    this.typeName$ = from(this.route.snapshot.paramMap.get('contentTypeStaticName'));
  }

  ngAfterViewInit(): void {
    this.currentScenario = this.scenarioPicker.current$;
    this.currentEnv = this.envPicker.current$;
    this.currentScenario.subscribe(cs => this.modeInternal = cs.key === 'internal');
    this.wireUpObservables();
    // explicitly declare that we made changes
    this.cdRef.detectChanges();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  /** setup all observables */
  wireUpObservables() {
    // type name
    // this.typeName$ = this.route.paramMap.pipe(
    //   map((params: ParamMap) => {
    //     return params.get('name');
    //   })
    // );

    // extract real app-name from the app-path and provide it in the named-root
    const appPath = '/todo/todo/spm-where-is-the-api-root/'; // this.context. this.state.rootApp || '/put-app-name-here/';
    const appName = appPath.substring(
      appPath.lastIndexOf('/') + 1,
      appPath.length
    );

    this.root$ = combineLatest([
      this.typeName$,
      this.currentEnv,
      this.currentScenario,
    ]).pipe(
      map(([t, s, scenario]) => {
        const internal = scenario === AccessScenarios[0];
        return (internal ? '' : (s as EnvironmentSelectorData).rootPath)
          + pathToContent
            .replace('{typename}', t)
            .replace('{appname}', internal ? 'auto' : appName);
      })
    );

  }

  // todo: 2dm - probably open a dialog showing the results etc.
  callApiGet(url: Observable<string>) {
    url.pipe(
      take(1),
      tap(path => console.log(path)),
      map(path => this.http.get(path).toPromise())
    ).subscribe();
    this.openSnackBar('API call dispatched - to see it, you should have the console (F12) open.', 'API call');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}

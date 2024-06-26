import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { SourceService } from '../../code-editor/services/source.service';
import { CreateFileDialogComponent, CreateFileDialogData, CreateFileDialogResult } from '../../create-file-dialog';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { DialogService } from '../../shared/services/dialog.service';
import { WebApi } from '../models/web-api.model';
import { WebApiActionsComponent } from './web-api-actions/web-api-actions.component';
import { WebApiActionsParams } from './web-api-actions/web-api-actions.models';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { TrueFalseComponent } from '../../dev-rest/api/true-false/true-false.component';

@Component({
  selector: 'app-web-api',
  templateUrl: './web-api.component.html',
  styleUrls: ['./web-api.component.scss'],
})
export class WebApiComponent implements OnInit, OnDestroy {
  enableCode!: boolean;

  webApis$ = new BehaviorSubject<WebApi[]>(undefined);
  gridOptions = this.buildGridOptions();

  viewModel$: Observable<WebApiViewModel>;

  constructor(
    private sourceService: SourceService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private dialogConfigSvc: AppDialogConfigService,
  ) { }

  ngOnInit() {
    this.fetchWebApis();
    this.viewModel$ = combineLatest([this.webApis$]).pipe(
      map(([webApis]) => ({ webApis }))
    );

    this.dialogConfigSvc.getCurrent$().subscribe(settings => {
      this.enableCode = settings.Context.Enable.CodeEditor;
    });

  }

  ngOnDestroy() {
    this.webApis$.complete();
  }

  createController(global?: boolean): void {
    // This FileLocationDialogComponent dialog is currently never going to be opened because it has been replaced by mat-menu
    // in the web-api.component.html template. If you want to use the dialog instead of the menu, you need to remove the
    // mat-menu and replace it with a button that opens the dialog with empty parameters.
    // Dialog has been replaced by menu because from update to Angular 16 CreateFileDialogComponent wasn't opening anymore if
    // FileLocationDialogComponent dialog was used.
    // if (global == null) {
    //   const fileLocationDialogRef = this.dialog.open(FileLocationDialogComponent, {
    //     autoFocus: false,
    //     viewContainerRef: this.viewContainerRef,
    //     width: '650px',
    //   });
    //   fileLocationDialogRef.afterClosed().subscribe((isShared?: boolean) => {
    //     if (isShared == null) { return; }
    //     this.createController(isShared);
    //   });
    //   return;
    // }

    const createFileDialogData: CreateFileDialogData = {
      folder: 'api',
      global,
      purpose: 'Api',
    };
    const createFileDialogRef = this.dialog.open(CreateFileDialogComponent, {
      autoFocus: false,
      data: createFileDialogData,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });

    createFileDialogRef.afterClosed().subscribe((result?: CreateFileDialogResult) => {
      if (!result) { return; }

      if (result.name.endsWith('Controller.cs')) {
        const fileName = result.name.substring(result.name.lastIndexOf('/') + 1);
        if (!/^[A-Z][a-zA-Z0-9]*Controller\.cs$/g.test(fileName)) {
          const message = `"${fileName}" is invalid controller name. Should be something like "MyController.cs"`;
          this.snackBar.open(message, null, { duration: 5000 });
          return;
        }
      }

      this.snackBar.open('Saving...');
      this.sourceService.create(result.name, global, result.templateKey).subscribe(() => {
        this.snackBar.open('Saved', null, { duration: 2000 });
        this.fetchWebApis();
      });
    });
  }

  private fetchWebApis() {
    this.sourceService.getWebApis().subscribe(webApis => {
      this.webApis$.next(webApis);
    });
  }

  private enableCodeGetter() {
    return this.enableCode;
  }

  private openCode(api: WebApi) {
    this.dialogService.openCodeFile(api.path, api.isShared);
  }

  private openRestApi(api: WebApi) {
    this.router.navigate([GoToDevRest.getUrlWebApi(api)], { relativeTo: this.route.parent.firstChild });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'Endpoint',
          field: 'endpointPath',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
        },
        {
          headerName: 'Edition',
          field: 'edition',
          flex: 1,
          minWidth: 100,
          cellClass: 'no-outline',
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
        },
        {
          headerName: 'Forder2',
          field: 'folder',
          flex: 1,
          minWidth: 100,
          cellClass: 'no-outline',
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
        },
        {
          headerName: 'Name',
          field: 'name',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
        },
        // {
        //   field: 'Type',
        //   flex: 1,
        //   minWidth: 100,
        //   cellClass: 'no-outline',
        //   sortable: true,
        //   filter: BooleanFilterComponent,
        //   valueGetter: (params) => {
        //     const api: WebApi = params.data;
        //     return api.isShared;
        //   },
        //   cellRenderer: WebApiTypeComponent,
        // },
        {
          headerName: 'Compiled',
          field: 'isCompiled',
          width: 100,
          cellRenderer: TrueFalseComponent,
          cellClass: 'no-outline',
          sortable: true,
          filter: BooleanFilterComponent,
        },
        {
          width: 82,
          cellClass: 'secondary-action no-padding'.split(' '),
          pinned: 'right',
          cellRenderer: WebApiActionsComponent,
          cellRendererParams: (() => {
            const params: WebApiActionsParams = {
              enableCodeGetter: () => this.enableCodeGetter(),
              onOpenCode: (api) => this.openCode(api),
              onOpenRestApi: (api) => this.openRestApi(api),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}

interface WebApiViewModel {
  webApis: WebApi[];
}

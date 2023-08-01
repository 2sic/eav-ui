import { GridOptions } from '@ag-grid-community/core';
import { Component, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { SourceService } from '../../code-editor/services/source.service';
import { CreateFileDialogComponent, CreateFileDialogData, CreateFileDialogResult, FileLocationDialogComponent } from '../../create-file-dialog';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { DialogService } from '../../shared/services/dialog.service';
import { WebApi } from '../models/web-api.model';
import { WebApiActionsComponent } from './web-api-actions/web-api-actions.component';
import { WebApiActionsParams } from './web-api-actions/web-api-actions.models';
import { WebApiTypeComponent } from './web-api-type/web-api-type.component';

@Component({
  selector: 'app-web-api',
  templateUrl: './web-api.component.html',
  styleUrls: ['./web-api.component.scss'],
})
export class WebApiComponent implements OnInit, OnDestroy {
  @Input() enableCode: boolean;

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
  ) { }

  ngOnInit() {
    this.fetchWebApis();
    this.viewModel$ = combineLatest([this.webApis$]).pipe(
      map(([webApis]) => ({ webApis }))
    );
  }

  ngOnDestroy() {
    this.webApis$.complete();
  }

  createController(global?: boolean): void {
    if (global == null) {
      const fileLocationDialogRef = this.dialog.open(FileLocationDialogComponent, {
        autoFocus: false,
        viewContainerRef: this.viewContainerRef,
        width: '650px',
      });
      fileLocationDialogRef.afterClosed().subscribe((isShared?: boolean) => {
        if (isShared == null) { return; }
        this.createController(isShared);
      });
      return;
    }

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
    this.router.navigate([GoToDevRest.getUrlWebApi(api)], { relativeTo: this.route.firstChild });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          field: 'Folder',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const api: WebApi = params.data;
            return api.folder;
          },
        },
        {
          field: 'Name',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const api: WebApi = params.data;
            return api.name;
          },
        },
        {
          field: 'Type',
          flex: 1,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: BooleanFilterComponent,
          valueGetter: (params) => {
            const api: WebApi = params.data;
            return api.isShared;
          },
          cellRenderer: WebApiTypeComponent,
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

import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CreateFileDialogComponent, CreateFileDialogData, CreateFileDialogResult } from '../../create-file-dialog';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { DialogService } from '../../shared/services/dialog.service';
import { WebApiActionsComponent } from '../ag-grid-components/web-api-actions/web-api-actions.component';
import { WebApiActionsParams } from '../ag-grid-components/web-api-actions/web-api-actions.models';
import { WebApi } from '../models/web-api.model';
import { WebApisService } from '../services/web-apis.service';

@Component({
  selector: 'app-web-api',
  templateUrl: './web-api.component.html',
  styleUrls: ['./web-api.component.scss'],
})
export class WebApiComponent implements OnInit, OnDestroy {
  @Input() enableCode: boolean;

  webApis$ = new BehaviorSubject<WebApi[]>(null);
  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      webApiActions: WebApiActionsComponent,
    },
    columnDefs: [
      {
        headerName: 'Folder', field: 'folder', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, sort: 'asc', filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Name', field: 'name', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        width: 80, cellClass: 'secondary-action no-padding', cellRenderer: 'webApiActions', pinned: 'right',
        cellRendererParams: {
          enableCodeGetter: this.enableCodeGetter.bind(this),
          onOpenCode: this.openCode.bind(this),
          onOpenRestApi: this.openRestApi.bind(this),
        } as WebApiActionsParams,
      },
    ],
  };

  constructor(
    private webApisService: WebApisService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit() {
    this.fetchWebApis();
  }

  ngOnDestroy() {
    this.webApis$.complete();
  }

  createController(): void {
    const data: CreateFileDialogData = {
      purposeForce: 'Api',
    };
    const dialogRef = this.dialog.open(CreateFileDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });

    dialogRef.afterClosed().subscribe((result?: CreateFileDialogResult) => {
      if (!result) { return; }

      if (result.name.endsWith('Controller.cs') && !/^[A-Z][a-zA-Z0-9]*Controller\.cs$/g.test(result.name)) {
        const message = `"${result.name}" is invalid controller name. Should be something like "MyController.cs"`;
        this.snackBar.open(message, null, { duration: 5000 });
        return;
      }

      this.snackBar.open('Saving...');
      this.webApisService.create(result.name, result.templateKey).subscribe(() => {
        this.snackBar.open('Saved', null, { duration: 2000 });
        this.fetchWebApis();
      });
    });
  }

  private fetchWebApis() {
    this.webApisService.getAll().subscribe(webApis => {
      this.webApis$.next(webApis);
    });
  }

  private enableCodeGetter() {
    return this.enableCode;
  }

  private openCode(api: WebApi) {
    this.dialogService.openCodeFile(api.path);
  }

  private openRestApi(api: WebApi) {
    this.router.navigate([GoToDevRest.getUrlWebApi(api)], { relativeTo: this.route.firstChild });
  }

}

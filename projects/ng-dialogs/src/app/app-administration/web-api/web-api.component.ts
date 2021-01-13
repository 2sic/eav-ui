import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SanitizeHelper } from '../../../../../edit/eav-material-controls/adam/sanitize.helper';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { defaultControllerName } from '../../shared/constants/file-names.constants';
import { DialogService } from '../../shared/services/dialog.service';
import { WebApiActionsComponent } from '../ag-grid-components/web-api-actions/web-api-actions.component';
import { WebApiActionsParams } from '../ag-grid-components/web-api-actions/web-api-actions.models';
import { WebApi } from '../models/web-api.model';
import { WebApisService } from '../services/web-apis.service';

@Component({
  selector: 'app-web-api',
  templateUrl: './web-api.component.html',
  styleUrls: ['./web-api.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebApiComponent implements OnInit, OnDestroy {
  @Input() private enableCode: boolean;

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
        sortable: true, filter: 'agTextColumnFilter',
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
  ) { }

  ngOnInit() {
    this.fetchWebApis();
  }

  ngOnDestroy() {
    this.webApis$.complete();
  }

  addController() {
    let name = prompt('Controller name:', defaultControllerName);
    if (name === null || name.length === 0) { return; }

    name = SanitizeHelper.sanitizePath(name);
    name = name.replace(/\s/g, ''); // remove all whitespaces
    // find name without extension
    let nameLower = name.toLocaleLowerCase();
    const extIndex = nameLower.lastIndexOf('.cs');
    if (extIndex > 0) {
      nameLower = nameLower.substring(0, extIndex);
    }
    const typeIndex = nameLower.lastIndexOf('controller');
    if (typeIndex > 0) {
      nameLower = nameLower.substring(0, typeIndex);
    }
    // uppercase first letter, take other letters as is and append extension
    name = name.charAt(0).toLocaleUpperCase() + name.substring(1, nameLower.length) + 'Controller.cs';

    this.snackBar.open('Saving...');
    this.webApisService.create(name).subscribe(res => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.fetchWebApis();
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
    this.router.navigate([GoToDevRest.goToWebApi(api)], { relativeTo: this.route.firstChild });
  }

}

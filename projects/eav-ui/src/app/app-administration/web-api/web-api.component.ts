import { GridOptions } from '@ag-grid-community/core';
import { Component, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { SourceService } from '../../code-editor/services/source.service';
import { CreateFileDialogComponent, CreateFileDialogData, CreateFileDialogResult } from '../../create-file-dialog';
import { TrueFalseComponent } from '../../dev-rest/api/true-false/true-false.component';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogInNewWindowService } from '../../shared/routing/dialog-in-new-window.service';
import { GridWithHelpComponent, HelpTextConst } from '../grid-with-help/grid-with-help.component';
import { WebApi } from '../models/web-api.model';
import { DialogConfigAppService } from '../services/dialog-config-app.service';
import { WebApiActionsComponent } from './web-api-actions/web-api-actions.component';
import { WebApiActionsParams } from './web-api-actions/web-api-actions.models';

@Component({
  selector: 'app-web-api',
  templateUrl: './web-api.component.html',
  imports: [
    SxcGridModule,
    MatDialogActions,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    RouterOutlet,
    GridWithHelpComponent,
  ]
})
export class WebApiComponent implements OnInit {

  #dialogInNewWindowSvc = transient(DialogInNewWindowService);
  #sourceSvc = transient(SourceService);

  enableCode!: boolean;
  refresh = signal(0);
  webApis = this.#sourceSvc.getWebApisLive(this.refresh)

  gridOptions = this.buildGridOptions();

  private dialogConfigSvc = transient(DialogConfigAppService);

  // UI Help Text for the UX Help Info Card
  #helpTextConst: HelpTextConst = {
    empty: {
      description: '<p><b>This is where you manage Web APIs</b><br>They are custom C# code which do anything you want.</p>',
      hint: "<p>WebApi Controllers are listed automatically. <br>Click the (+) in the bottom right corner to create your first Web API from a template file.</p>"
    },
    content: {
      description: '<p><b>This is where you manage Web APIs</b><br>They are custom C# code which do anything you want.</p>',
      hint: ''
    }
  };

  uxHelpText = signal(this.#helpTextConst.empty);

  constructor(
    private snackBar: MatSnackBar,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit() {
    this.dialogConfigSvc.getCurrent$().subscribe(settings => {
      this.enableCode = settings.Context.Enable.CodeEditor;
    });

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
    //     if (isShared == null) return;
    //     this.createController(isShared);
    //   });
    //   return;
    // }

    const createFileDialogData: CreateFileDialogData = {
      folder: 'api',
      global,
      purpose: 'Api',
    };
    const createFileDialogRef = this.matDialog.open(CreateFileDialogComponent, {
      autoFocus: false,
      data: createFileDialogData,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });

    createFileDialogRef.afterClosed().subscribe((result?: CreateFileDialogResult) => {
      if (!result) return;

      if (result.name.endsWith('Controller.cs')) {
        const fileName = result.name.substring(result.name.lastIndexOf('/') + 1);
        if (!/^[A-Z][a-zA-Z0-9]*Controller\.cs$/g.test(fileName)) {
          const message = `"${fileName}" is invalid controller name. Should be something like "MyController.cs"`;
          this.snackBar.open(message, null, { duration: 5000 });
          return;
        }
      }

      this.snackBar.open('Saving...');
      this.#sourceSvc.create(result.name, global, result.templateKey).subscribe(() => {
        this.snackBar.open('Saved', null, { duration: 2000 });
        this.refresh.update(v => ++v);
        this.uxHelpText.set(
          this.webApis().length === 0
            ? this.#helpTextConst.empty
            : this.#helpTextConst.content
        );
      });
    });
  }

  private enableCodeGetter() {
    return this.enableCode;
  }

  private openCode(api: WebApi) {
    this.#dialogInNewWindowSvc.openCodeFile(api.path, api.isShared);
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.ItemsText,
          headerName: 'Endpoint',
          field: 'endpointPath',
          flex: 2,
          minWidth: 250,
        },
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Edition',
          field: 'edition',
          sort: 'asc',
        },
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Forder2',
          field: 'folder',
          sort: 'asc',
        },
        {
          ...ColumnDefinitions.TextWide,
          headerName: 'Name',
          field: 'name',
        },
        {
          ...ColumnDefinitions.Boolean2,
          headerName: 'Compiled',
          field: 'isCompiled',
          cellRenderer: TrueFalseComponent,
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight6,
          cellRenderer: WebApiActionsComponent,
          cellRendererParams: (() => {
            const params: WebApiActionsParams = {
              enableCodeGetter: () => this.enableCodeGetter(),
              onOpenCode: (api) => this.openCode(api),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}

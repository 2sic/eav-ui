import { GridOptions } from '@ag-grid-community/core';
import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { transient } from 'projects/core';
import { ContentExportService } from '../../../content-export/services/content-export.service';
import { ContentItem } from '../../../content-items/models/content-item.model';
import { ContentItemsService } from '../../../content-items/services/content-items.service';
import { FeatureTextInfoComponent } from '../../../features/feature-text-info/feature-text-info.component';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { convertFormToUrl } from '../../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../../shared/models/edit-form.model';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { DataBundleActionsComponent } from './data-bundles-actions/data-bundles-actions.component';
import { DataBundlesActionsParams } from './data-bundles-actions/data-bundles-actions.models';

@Component({
  selector: 'app-data-bundles',
  standalone: true,
  imports: [
    FeatureTextInfoComponent,
    SxcGridModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './data-bundles.component.html',
  styleUrl: './data-bundles.component.scss'
})
export class DataBundlesComponent {

  #contentItemsSvc = transient(ContentItemsService);
  #contentExportSvc = transient(ContentExportService);
  // #exportAppSvc = transient(ExportAppService);
  // #importAppPartsSvc = transient(ImportAppPartsService);
  #dialogRouter = transient(DialogRoutingService);
  #contentTypeStaticName = "d7f2e4fa-5306-41bb-a3cd-d9529c838879";

  constructor(private snackBar: MatSnackBar) { }

  #refresh = signal(0);
  items = computed(() => {
    const refresh = this.#refresh();
    return this.#contentItemsSvc.getAllSig(this.#contentTypeStaticName, undefined);
  });

  gridOptions = this.#buildGridOptions();

  ngOnInit() {
    this.#dialogRouter.doOnDialogClosed(() => this.#fetchItems());
  }

  #fetchItems() {
    this.#refresh.update(value => value + 1)
  }

  editItem(item?: ContentItem) {
    const form: EditForm = {
      items: [
        item == null
          ? EditPrep.newFromType(this.#contentTypeStaticName)
          : EditPrep.editId(item.Id)
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRouter.navRelative([`edit/${formUrl}`]);
  }

  #download(item: ContentItem) {
    this.#contentExportSvc.exportDataBundle(item.Guid);
  }

  #saveState(item: ContentItem) {
    console.log('Save State', item);
    // this.snackBar.open('Exporting...');
    // this.#exportAppSvc.exportForVersionControl({ includeContentGroups: true, resetAppGuid: false, withFiles: false }).subscribe({
    //   next: _ => this.snackBar.open('Export completed into the \'App_Data\' folder.', null, { duration: 3000 }),
    //   error: _ => this.snackBar.open('Export failed. Please check console for more information', null, { duration: 3000 }),
    // });
  }

  #restoreState(item: ContentItem) {
    console.log('Restore State', item);
    // if (!confirm('Are you sure? All changes since last xml export will be lost'))
    //   return;
    // this.snackBar.open('Resetting...');
    // this.#importAppPartsSvc.resetApp(false /*withFiles*/).subscribe({
    //   next: _ => this.snackBar.open('Reset worked! Since this is a complex operation, please restart the Website to ensure all caches are correct', null, { duration: 30000 }),
    //   error: _ => this.snackBar.open('Reset failed. Please check console for more details', null, { duration: 3000 }),
    // });
  }


  #buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.TextWideActionClass,
          headerName: 'Name',
          field: 'Name',
          flex: 2,
          onCellClicked: (p: { data: ContentItem }) => this.editItem(p.data),
        },
        {
          ...ColumnDefinitions.TextWideFlex3,
          headerName: 'File-Name',
          field: 'FileName',
        },
        {
          ...ColumnDefinitions.TextWideActionClass,
          headerName: 'Entities',
          field: 'Entities',
          onCellClicked: (p: { data: ContentItem }) => this.editItem(p.data), // Later: Dialog Entities
          valueFormatter: (params) => {
            return params.value !== undefined && params.value !== null ? params.value : 0;
          },
        },
        {
          ...ColumnDefinitions.TextWideActionClass,
          headerName: 'Content-Type',
          field: 'ContentType',
          onCellClicked: (p: { data: ContentItem }) => this.editItem(p.data), // Later: Dialog Content-Type
          valueFormatter: (params) => {
            return params.value !== undefined && params.value !== null ? params.value : 0;
          },
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight3,
          cellRenderer: DataBundleActionsComponent,
          cellRendererParams: (() => {
            const params: DataBundlesActionsParams = {
              do: (verb, item) => {
                switch (verb) {
                  case 'download': this.#download(item); break;
                  case 'saveState': this.#saveState(item); break;
                  case 'restoreState': this.#restoreState(item); break;
                }
              }
            } satisfies DataBundlesActionsParams;
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}

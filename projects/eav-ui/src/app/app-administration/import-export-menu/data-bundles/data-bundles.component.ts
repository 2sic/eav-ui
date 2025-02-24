import { GridOptions } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { transient } from 'projects/core';
import { take } from 'rxjs';
import { ContentItem } from '../../../content-items/models/content-item.model';
import { ContentItemsService } from '../../../content-items/services/content-items.service';
import { FeatureTextInfoComponent } from '../../../features/feature-text-info/feature-text-info.component';
import { AgGridHelper } from '../../../shared/ag-grid/ag-grid-helper';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { FileUploadDialogData, FileUploadMessageTypes, FileUploadResult } from '../../../shared/components/file-upload-dialog';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { DragAndDropDirective } from '../../../shared/directives/drag-and-drop.directive';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { convertFormToUrl } from '../../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../../shared/models/edit-form.model';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { DataBundleActionsComponent } from './data-bundles-actions/data-bundles-actions.component';
import { DataBundlesActionsParams } from './data-bundles-actions/data-bundles-actions.models';
import { DataBundlesQueryService } from './data-bundles-query.service';
import { DataBundlesService } from './data-bundles.service';

@Component({
  selector: 'app-data-bundles',
  imports: [
    FeatureTextInfoComponent,
    SxcGridModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    DragAndDropDirective,
    NgClass,
    MatProgressSpinnerModule,
    TippyDirective,
  ],
  templateUrl: './data-bundles.component.html',
  styleUrl: './data-bundles.component.scss'
})
export class DataBundlesComponent {


  #contentItemsSvc = transient(ContentItemsService);
  #dialogRouter = transient(DialogRoutingService);
  #dataBundlesQueryService = transient(DataBundlesQueryService);
  #dataBundlesService = transient(DataBundlesService);

  #defaultContentTypeId = "d7f2e4fa-5306-41bb-a3cd-d9529c838879";
  height = 'height: 135px';
  FileUploadMessageTypes = FileUploadMessageTypes;
  gridOptions = this.#buildGridOptions();

  constructor(private snackBar: MatSnackBar) { }

  #refresh = signal(0);
  uploading = signal(false);
  files = signal<File[]>([]);
  result = signal<FileUploadResult>(undefined);

  importData: FileUploadDialogData = {
    title: 'Import Data Bundles into this App',
    allowedFileTypes: 'json',
    upload$: (files: File[]) => this.#dataBundlesService.import(files),
  };

  dataBundles = computed(() => {
    this.#refresh(); // is use to trigger a refresh when new data or data are modified
    return this.#contentItemsSvc.getAllSig(this.#defaultContentTypeId,  /* initial: */ null);
  });

  // ContentItem
  // TODO: @2dg - this 'any' is pretty bad, should be a proper type or better still, not used at all
  #queryResults = signal<ContentItem[] | any>([]);

  // Prepare Date from Query Service
  #queryData = computed(() => {
    const dataBundles = this.dataBundles()();
    dataBundles?.forEach(dataBundle => {
      if (dataBundle?.Guid) {
        this.#dataBundlesQueryService.fetchQuery(dataBundle.Guid).subscribe({
          next: (data) => {
            const bundleQuery = {
              Guid: dataBundle.Guid,
              Result: data
            };
            this.#queryResults.set([...this.#queryResults(), bundleQuery]);
          },
          error: (err) => console.error("Query error: ", err)
        });
      }
    });
  });

  // Data from QueryData for Table
  dataSourceData = computed(() => {
    const dataBundles = this.dataBundles()() || [];
    this.#queryData(); // Get query data
    const queryResults = this.#queryResults();

    const countEntitiesAndContentTypes = (guid: string) => {
      const result = queryResults.find((result: ContentItem) => result.Guid === guid)?.Result || [];
      const entityCount = result.filter((item: ContentItem) => item.TypeName == "ContentType").length;
      const contentTypeCount = result.filter((item: ContentItem) => item.TypeName != "ContentType").length;
      return { entityCount, contentTypeCount };
    };

    const result = dataBundles.map(bundle => {
      const { entityCount, contentTypeCount } = countEntitiesAndContentTypes(bundle.Guid);
      return {
        FileName: bundle.FileName,
        Name: bundle.Name,
        Guid: bundle.Guid,
        Id: bundle.Id,
        Entities: entityCount,
        ContentType: contentTypeCount
      };
    });
    // TODO: @2dg - this is a side-effect in a computed, which is very bad.
    // Should be a separate computed
    this.height = `height: ${result.length * 46 + 90}px`;

    return result;
  });


  ngOnInit() {
    // Reload Data after Close Dialog
    this.#dialogRouter.doOnDialogClosed(() => this.#fetchItems());
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
  }

  #fetchItems() {
    this.#refresh.update(value => value + 1)
  }

  // Files Drop
  filesDropped(files: File[]) {
    const importFile = files[0];
    const ext = importFile.name.substring(importFile.name.lastIndexOf('.') + 1).toLocaleLowerCase();
    switch (ext) {
      case 'xml':
        this.#importDataBundles(files);
        break;
      case 'json':
        this.#importDataBundles(files);
        break;
    }
  }

  // Import Files Button Logic
  /**
 * Handles file selection from an input event.
 * Converts the selected file(s) into an array and updates the internal file state.
 * @param event - The file input change event.
 */
  filesChanged(event: Event): void {
    const fileList = (event.target as HTMLInputElement).files;
    const files = Array.from(fileList);
    this.#setFiles(files);
  }

  /**
 * Initiates the upload process for the selected files.
 * Sets the uploading state to true and subscribes to the upload process.
 * On success, updates the result and fetches items; on error, resets the state and shows an error message.
 */
  upload(): void {
    this.uploading.set(true);
    this.importData.upload$(this.files()).pipe(take(1)).subscribe({
      next: (result) => {
        this.uploading.set(false);
        this.result.set(result);
        this.#fetchItems();
      },
      error: () => {
        this.uploading.set(false);
        this.result.set(undefined);
        this.snackBar.open('Upload failed. Please check console for more information', undefined, { duration: 3000 });
      },
    });
  }

  /**
 * Sets the internal file list, ensuring only a single file is kept
 * if the `multiple` flag in `importData` is set to false.
 * @param files - The array of files to set.
 */
  #setFiles(files: File[]): void {
    if (!this.importData.multiple) {
      files = files.slice(0, 1);
    }
    this.files.set(files);
  }

  // Import Data Bundles from File Drop
  #importDataBundles(files?: File[]) {
    const dialogData: FileUploadDialogData = { files };
    this.#dialogRouter.navRelative(['import'], { state: dialogData });
  }

  // Open Edit Dialog
  editItem(item?: ContentItem) {
    const form: EditForm = {
      items: [
        item == null
          ? EditPrep.newFromType(this.#defaultContentTypeId)
          : EditPrep.editId(item.Id)
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRouter.navRelative([`edit/${formUrl}`]);
  }

  // Export Data to Download Json File
  #export(item: ContentItem) {
    this.#dataBundlesService.exportDataBundle(item.Guid);
  }

  // Save State
  #saveState(item: ContentItem) {
    this.snackBar.open('Save Bundle State...');
    this.#dataBundlesService.saveDataBundles(item.Guid).subscribe({
      next: _ => this.snackBar.open('Export completed into the \'App_Data\' folder.', null, { duration: 3000 }),
      error: _ => this.snackBar.open('Export failed. Please check console for more information', null, { duration: 3000 }),
    });
  }

  // Restore State
  #restoreState(item: ContentItem) {
    this.snackBar.open('Restore Bundle State...');
    this.#dataBundlesService.restoreDataBundles(item.FileName).subscribe({
      next: _ => this.snackBar.open('Reset worked! Since this is a complex operation, please restart the Website to ensure all caches are correct', null, { duration: 30000 }),
      error: _ => this.snackBar.open('Reset failed. Please check console for more details', null, { duration: 3000 }),
    });
  }

  // Grid Options Config
  #buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Name',
          field: 'Name',
          flex: 2,
          cellRenderer: (p: { data: ContentItem }) => AgGridHelper.cellLink('#' + this.#dialogRouter.urlSubRoute(`details/${p.data.Guid}/${p.data.Name}`), p.data.Name),
        },
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'File-Name',
          field: 'FileName',
        },
        {
          ...ColumnDefinitions.Number2,
          headerName: 'Entities',
          field: 'Entities',
        },
        {
          ...ColumnDefinitions.Number2,
          headerName: 'Content-Type',
          field: 'ContentType',
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight3,
          cellRenderer: DataBundleActionsComponent,
          cellRendererParams: {
            do: (verb, item) => {
              switch (verb) {
                case 'edit': this.editItem(item); break;
                case 'download': this.#export(item); break;
                case 'saveState': this.#saveState(item); break;
                case 'restoreState': this.#restoreState(item); break;
              }
            }
          } satisfies DataBundlesActionsParams,
        },
      ],
    };
    return gridOptions;
  }
}

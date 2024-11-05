import { GridOptions } from '@ag-grid-community/core';
import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { transient } from 'projects/core';
import { ContentExportService } from '../../../content-export/services/content-export.service';
import { ContentItem } from '../../../content-items/models/content-item.model';
import { ContentItemsService } from '../../../content-items/services/content-items.service';
import { FeatureTextInfoComponent } from '../../../features/feature-text-info/feature-text-info.component';
import { AgGridHelper } from '../../../shared/ag-grid/ag-grid-helper';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { convertFormToUrl } from '../../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../../shared/models/edit-form.model';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { DataBundleActionsComponent } from './data-bundles-actions/data-bundles-actions.component';
import { DataBundlesActionsParams } from './data-bundles-actions/data-bundles-actions.models';
import { DataBundlesService } from './data-bundles-query.service';

@Component({
  selector: 'app-data-bundles',
  standalone: true,
  imports: [
    FeatureTextInfoComponent,
    SxcGridModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    JsonPipe,
  ],
  templateUrl: './data-bundles.component.html',
  styleUrl: './data-bundles.component.scss'
})
export class DataBundlesComponent {

  #contentItemsSvc = transient(ContentItemsService);
  #contentExportSvc = transient(ContentExportService);
  #dialogRouter = transient(DialogRoutingService);
  #dataBundlesService = transient(DataBundlesService);

  #defaultContentTypeId = "d7f2e4fa-5306-41bb-a3cd-d9529c838879";

  constructor() { }

  height = 'height: 135px';

  #refresh = signal(0);

  dataBundles = computed(() => {
    this.#refresh(); // is use to trigger a refresh when new data or data are modified
    return this.#contentItemsSvc.getAllSig(this.#defaultContentTypeId, undefined);
  });

  // ContentItem
  // TODO: @2dg - this 'any' is pretty bad, should be a proper type or better still, not used at all
  #queryResults = signal<ContentItem[] | any>([]);

  #queryData = computed(() => {
    const dataBundles = this.dataBundles()();
    dataBundles?.forEach(dataBundle => {
      if (dataBundle?.Guid) {
        this.#dataBundlesService.fetchQuery(dataBundle.Guid).subscribe({
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
          ? EditPrep.newFromType(this.#defaultContentTypeId)
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
          cellRendererParams: (() => {
            const params: DataBundlesActionsParams = {
              do: (verb, item) => {
                switch (verb) {
                  case 'edit': this.editItem(item); break;
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

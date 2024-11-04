import { GridOptions } from '@ag-grid-community/core';
import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { transient } from 'projects/core';
import { Observable } from 'rxjs';
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
import { QueryService } from '../../../shared/services/query.service';
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
    JsonPipe,
  ],
  templateUrl: './data-bundles.component.html',
  styleUrl: './data-bundles.component.scss'
})
export class DataBundlesComponent {

  #contentItemsSvc = transient(ContentItemsService);
  #contentExportSvc = transient(ContentExportService);
  #dialogRouter = transient(DialogRoutingService);
  // TODO: @2dg should have a better name, this is like calling a string a string. What is it for?
  #contentTypeGuid = "d7f2e4fa-5306-41bb-a3cd-d9529c838879";

  #queryService = transient(QueryService);

  constructor(private translate: TranslateService,) { }

  // TODO: @2dg - odd place to put CSS, should be in the template or in the scss
  height = 'height: 135px';

  #refresh = signal(0);

  dataBundles = computed(() => {
    this.#refresh(); // is use to trigger a refresh when new data or data are modified
    return this.#contentItemsSvc.getAllSig(this.#contentTypeGuid, undefined);
  });

  #queryResults = signal<any[]>([]);

  #queryData = computed(() => {
    const dataBundles = this.dataBundles()();
    dataBundles?.forEach(dataBundle => {
      if (dataBundle?.Guid) {
        this.#fetchQuery(dataBundle.Guid).subscribe({
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
    // TODO: @2dg no German comments
    this.#queryData(); // Get query data
    const queryResults = this.#queryResults();

    const countEntitiesAndContentTypes = (guid: string) => {
      const result = queryResults.find(result => result.Guid === guid)?.Result || [];
      const entityCount = result.filter((item: any) => item.TypeName == "ContentType").length;
      const contentTypeCount = result.filter((item: any) => item.TypeName != "ContentType").length;
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
    // TODO: @2dg should be done in the template or in the scss
    this.height = `height: ${result.length * 45 + 90}px`;

    return result;
  });


  gridOptions = this.#buildGridOptions();

  ngOnInit() {
    this.#dialogRouter.doOnDialogClosed(() => this.#fetchItems());
  }

  // TODO: @2dg #Code-Smell: This looks like it was copied from somewhere else.
  // TODO: @2dm Yes, A part was copied and reused as an observable
  #fetchQuery(guid?: string): Observable<any> {
    const stream = 'Default';
    const params = `configurationguid=${guid}`;

    return new Observable(observer => {
      this.#queryService.getFromQuery(`System.BundleDetails/${stream}`, params, null).subscribe({
        next: (data) => {
          if (!data) {
            console.error(this.translate.instant('Fields.Picker.QueryErrorNoData'));
            observer.error('No data found');
            return;
          }
          if (!data[stream]) {
            console.error(this.translate.instant('Fields.Picker.QueryStreamNotFound') + ' ' + stream);
            observer.error('Stream not found');
            return;
          }
          observer.next(data[stream]);
          observer.complete();
        },
        error: (error) => {
          console.error(`${this.translate.instant('Fields.Picker.QueryError')} - ${error.data}`);
          observer.error(error);
        }
      });
    });
  }


  #fetchItems() {
    this.#refresh.update(value => value + 1)
  }

  editItem(item?: ContentItem) {
    const form: EditForm = {
      items: [
        item == null
          ? EditPrep.newFromType(this.#contentTypeGuid)
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
        },
        {
          ...ColumnDefinitions.TextWideActionClass,
          headerName: 'Content-Type',
          field: 'ContentType',
          onCellClicked: (p: { data: ContentItem }) => this.editItem(p.data), // Later: Dialog Content-Type
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

import { GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { Component, Input, computed } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { transient } from 'projects/core';
import { FeaturesService } from '../../features/features.service';
import { AgGridHelper } from '../../shared/ag-grid/ag-grid-helper';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { ItemIdHelper } from '../../shared/models/item-id-helper';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { SysDataService } from '../../shared/services/sys-data.service';

@Component({
  selector: 'app-entity-relationships',
  templateUrl: './relationships-table.html',
  styleUrls: ['./relationships-table.scss'],
  imports: [SxcGridModule, RouterOutlet],
})
export class EntityRelationshipsComponent {
  @Input({ required: true }) entityId!: number;
  @Input() featureEnabled = false;

  readonly source = '4f5faacb-27bd-4946-ae41-9fe46f9f260c';

  #dialogRouter = transient(DialogRoutingService);
  #sysData = transient(SysDataService);
  #features = transient(FeaturesService);
  #resource = this.#sysData.getMany<{ default: RelationshipRow[] }>({
    source: this.source,
    params: computed(() => ({ Id: this.entityId })),
    fields: 'id,title,field,isChild,contentTypeName',
    streams: 'Default',
  });

  gridOptions = this.#buildGridOptions();

  loading = computed(() => this.#resource.isLoading());

  isFeatureEnabled = computed(() => {
    const feature = this.#features.getCurrent('EntityInspectRelationships');

    // If feature not found -> enabled
    if (!feature)
      return true;

    return feature.isEnabled;
  });

  readonly rows = computed<RelationshipRow[]>(() => {
    const value = this.#resource.value();
    return value?.default ?? [];
  });

  children = computed(() => this.rows().filter(r => r.isChild));
  parents = computed(() => this.rows().filter(r => !r.isChild));

  #buildGridOptions(): GridOptions {
    return {
      domLayout: 'autoHeight',
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'Id',
          field: 'id',
          width: 90,
          sortable: true,
          filter: 'agNumberColumnFilter'
        },
        {
          headerName: 'Title',
          field: 'title',
          flex: 2,
          minWidth: 260,
          sortable: true,
          filter: 'agTextColumnFilter',
          context: { isTitleLink: true },

          cellRenderer: (p: ICellRendererParams<RelationshipRow>) => {
            const row = p.data;
            if (!row)
              return '';

            const url = this.#dialogRouter.linkSubRoute(this.isFeatureEnabled()
              ? `edit/${convertFormToUrl({ items: [ItemIdHelper.editId(row.id)] })}`
              : `features/details/EntityInspectRelationships`
            );

            return AgGridHelper.cellLink(url, row.title);
          },
        },
        {
          headerName: 'Field',
          field: 'field',
          minWidth: 160,
          sortable: true,
          filter: 'agTextColumnFilter'
        },
        {
          headerName: 'Content-Type',
          field: 'contentTypeName',
          minWidth: 180,
          sortable: true,
          filter: 'agTextColumnFilter'
        },
      ],
    };
  }
}

interface RelationshipRow {
  id: number;
  title: string;
  field: string;
  isChild: boolean;
  contentTypeName: string;
}
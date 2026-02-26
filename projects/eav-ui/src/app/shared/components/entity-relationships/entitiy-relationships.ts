import { GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { Component, Input, computed } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { transient } from 'projects/core';
import { AgGridHelper } from '../../ag-grid/ag-grid-helper';
import { convertFormToUrl } from '../../helpers/url-prep.helper';
import { RelationshipColDef } from '../../models/entity-relationships.models';
import { ItemIdHelper } from '../../models/item-id-helper';
import { SxcGridModule } from '../../modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../routing/dialog-routing.service';
import { SysDataService } from '../../services/sys-data.service';

@Component({
    selector: 'app-entity-relationships',
    templateUrl: './entity-relationships.html',
    styleUrls: ['./entity-relationships.scss'],
    standalone: true,
    imports: [SxcGridModule, RouterOutlet],
})
export class EntityRelationshipsComponent {
    @Input({ required: true }) entityId!: number;
    @Input() entityTitle?: string;

    #dialogRouter = transient(DialogRoutingService);
    #sysData = transient(SysDataService);

    gridOptions = this.#buildGridOptions();

    readonly #source = '4f5faacb-27bd-4946-ae41-9fe46f9f260c';

    #resource = this.#sysData.getMany<{ default: RelationshipRow[] }>({
        source: this.#source,
        params: computed(() => ({ Id: this.entityId })),
        fields: 'id,title,field,isChild,contentTypeName',
        streams: 'Default',
    });

    loading = computed(() => this.#resource.isLoading());

    rows = computed<RelationshipRow[]>(() => {
        const v = this.#resource.value() as any;
        return v?.default ?? v?.Default ?? [];
    });

    children = computed(() => this.rows().filter(r => r.isChild));
    parents = computed(() => this.rows().filter(r => !r.isChild));

    #buildGridOptions(): GridOptions {
        const gridOptions: GridOptions = {
            columnDefs: [
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
                        if (!row) return '';
                        return AgGridHelper.cellLink(this.#urlToOpenEditView(row), row.title);
                    },
                },
                {
                    headerName: 'Id',
                    field: 'id',
                    width: 90,
                    sortable: true,
                    filter: 'agNumberColumnFilter'
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
            ] satisfies RelationshipColDef[],
        };

        return gridOptions;
    }

    #urlTo(url: string) {
        return '#' + this.#dialogRouter.urlSubRoute(url);
    }

    #urlToOpenEditView(row: RelationshipRow) {
        return this.#urlTo(
            `edit/${convertFormToUrl({
                items: [ItemIdHelper.editId(row.id)],
            })}`
        );
    }
}

interface RelationshipRow {
  id: number;
  title: string;
  field: string;
  isChild: boolean;
  contentTypeName: string;
}
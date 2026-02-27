import { GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { Component, Input, computed } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { transient } from 'projects/core';
import { FeaturesService } from '../../../features/features.service';
import { AgGridHelper } from '../../ag-grid/ag-grid-helper';
import { convertFormToUrl } from '../../helpers/url-prep.helper';
import { ItemIdHelper } from '../../models/item-id-helper';
import { SxcGridModule } from '../../modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../routing/dialog-routing.service';
import { SysDataService } from '../../services/sys-data.service';

@Component({
    selector: 'app-entity-relationships',
    templateUrl: './entity-relationships.html',
    styleUrls: ['./entity-relationships.scss'],
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

                        const url = this.isFeatureEnabled()
                            ? this.#urlToOpenEditView(row)
                            : this.#urlToOpenFeatureDetails('EntityInspectRelationships');

                        return AgGridHelper.cellLink(url, row.title);
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
            ],
        };
    }

    #urlTo(url: string) {
        return '#' + this.#dialogRouter.urlSubRoute(url);
    }

    #urlToOpenFeatureDetails(featureId: string): string {
        return this.#urlTo(`features/details/${featureId}`);
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
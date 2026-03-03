import { Component, computed, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterOutlet } from "@angular/router";
import { transient } from 'projects/core';
import { FeatureInfoBoxComponent } from "../../features/feature-info-box/feature-info-box";
import { FeatureIconWithDialogComponent } from '../../features/icons/feature-icon-with-dialog';
import { DialogHeaderComponent } from '../../shared/dialog-header/dialog-header';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { SysDataService } from '../../shared/services/sys-data.service';
import { EntityRelationshipsComponent } from './relationships-table';

type EntityLookupResult = {
  title?: string;
};

@Component({
  selector: 'app-relationships-dialog',
  templateUrl: './relationships-dialog.html',
  styleUrls: ['./relationships-dialog.scss'],
  imports: [
    DialogHeaderComponent,
    EntityRelationshipsComponent,
    RouterOutlet,
    FeatureIconWithDialogComponent,
    FeatureInfoBoxComponent
  ],
})
export class RelationshipsPageComponent {
  readonly featureId = 'EntityInspectRelationships';

  #dialogRouter = transient(DialogRoutingService);
  #sysData = transient(SysDataService);

  protected dialog = inject(MatDialogRef<RelationshipsPageComponent>);

  constructor() { }

  itemId = computed(() => Number(this.#dialogRouter.getParam('itemId')));
  
  entity = this.#sysData.getFirst<EntityLookupResult>({
    source: 'System.GetEntities',
    streams: 'Default',
    params: computed(() => ({ 
      entityIds: String(this.itemId()),
    })),
    fields: 'Title',
  });

  entityTitle = computed(() => {
    const e = this.entity();
    return e?.title ?? '';
  });
}

export interface RelationshipsDialogData {
  entityId: number;
  entityTitle: string;
}
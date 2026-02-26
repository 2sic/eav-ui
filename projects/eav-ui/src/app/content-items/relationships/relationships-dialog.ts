import { Component, computed, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterOutlet } from "@angular/router";
import { transient } from 'projects/core';
import { FeatureInfoBoxComponent } from "../../features/feature-info-box/feature-info-box";
import { FeatureIconWithDialogComponent } from '../../features/icons/feature-icon-with-dialog';
import { EntityRelationshipsComponent } from '../../shared/components/entity-relationships/entitiy-relationships';
import { DialogHeaderComponent } from '../../shared/dialog-header/dialog-header';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

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

  constructor(
    private dialog: MatDialogRef<RelationshipsPageComponent>,
  ) { }

  itemId = computed(() => Number(this.#dialogRouter.getParam('itemId')));
  entityTitle = signal<string>('');

  closeDialog() {
    this.dialog.close();
  }
}

export interface RelationshipsDialogData {
  entityId: number;
  entityTitle: string;
}
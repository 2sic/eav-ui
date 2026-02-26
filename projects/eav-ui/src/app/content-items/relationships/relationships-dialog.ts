import { Component, computed, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterOutlet } from "@angular/router";
import { transient } from 'projects/core';
import { EntityRelationshipsComponent } from '../../shared/components/entity-relationships/entitiy-relationships';
import { DialogHeaderComponent } from '../../shared/dialog-header/dialog-header';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

export interface RelationshipsDialogData {
  entityId: number;
  entityTitle: string;
}

@Component({
  selector: 'app-relationships-dialog',
  templateUrl: './relationships-dialog.html',
  standalone: true,
  imports: [
    DialogHeaderComponent,
    EntityRelationshipsComponent,
    RouterOutlet
],
})
export class RelationshipsPageComponent {
  @HostBinding('className') hostClass = 'dialog-component';

  #dialogRouter = transient(DialogRoutingService);
  
   constructor(
    private dialog: MatDialogRef<RelationshipsPageComponent>,
    ) { }

  itemId = computed(() => Number(this.#dialogRouter.getParam('itemId')));
  title = computed(() => this.#dialogRouter.getParam('title') ?? '');

  closeDialog() {
    this.dialog.close();
  }
}
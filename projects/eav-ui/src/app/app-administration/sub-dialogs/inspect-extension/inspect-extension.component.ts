import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { transient } from 'projects/core';
import { AppExtensionsService } from '../../services/app-extensions.service';
import { ConfirmDeleteDialogData } from '../confirm-delete-dialog/confirm-delete-dialog.models';
import { InspectExtensionContentComponent } from './inspect-extension-content/inspect-extension-content.component';

@Component({
  selector: 'app-inspect-extension',
  templateUrl: './inspect-extension.component.html',
  styleUrls: ['./inspect-extension.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    MatCardModule,
    MatExpansionModule,
    InspectExtensionContentComponent,
  ]
})
export class InspectExtensionComponent {
  #extensionsSvc = transient(AppExtensionsService);

  extensionFolder = this.route.snapshot.paramMap.get('extension') as 'extension';

  preflightResult = this.#extensionsSvc.preflightExtension(this.extensionFolder, '').value;

  constructor(
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public dialogData: ConfirmDeleteDialogData,
    public dialog: MatDialogRef<{}>,
  ) {console.log(this.preflightResult()); }

  closeDialog(confirm?: boolean) {
    confirm
      ? this.dialog.close(confirm)
      : this.dialog.close();
  }
}

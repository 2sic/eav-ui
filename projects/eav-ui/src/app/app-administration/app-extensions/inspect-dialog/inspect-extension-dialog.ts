import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { transient } from 'projects/core';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { AppExtensionsService } from '../app-extensions.service';
import { InspectExtensionComponent } from '../inspect/inspect-extension-content';

@Component({
  templateUrl: './inspect-extension-dialog.html',
  styleUrls: ['./inspect-extension-dialog.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    MatCardModule,
    MatExpansionModule,
    InspectExtensionComponent,
    TippyDirective,
  ]
})
export class InspectExtensionDialog {
  #extensionsSvc = transient(AppExtensionsService);

  dialog = inject(MatDialogRef<{}>);
  #route = inject(ActivatedRoute);

  extensionFolder = this.#route.snapshot.paramMap.get('extension');
  edition = this.#route.snapshot.queryParamMap.get('edition') || '';

  preflightResult = this.#extensionsSvc.preflightExtension(this.extensionFolder, this.edition).value;
}

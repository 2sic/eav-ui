import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { ContentTypesService } from '../services';

@Component({
  selector: 'app-data-rest-api',
  imports: [
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterOutlet,
    SxcGridModule,
  ],
  templateUrl: './data-rest-api.component.html'
})
export class DataRestApiComponent {
  #contentTypesSvc = transient(ContentTypesService);
  #dialogRouter = transient(DialogRoutingService);

  #formBuilder = inject(FormBuilder);

  constructor() {
    // Update form if the url changes and the item is found
    effect(() => {
      const types = this.contentTypes();
      if (types.length === 0)
        return;

      const urlStaticName = this.#dialogRouter.urlSegments.at(-1);

      const type = types.find(ct => ct.NameId === urlStaticName);
      if (type)
        this.contentTypeForm.get('contentType').setValue(type.NameId);
    });
  }

  scope = signal('Default');
  contentTypes = this.#contentTypesSvc.getTypes(this.scope).value;

  contentTypeForm: FormGroup = this.#formBuilder.group({
    contentType: ['']
  });


  openRestApi(event: string): void {
    if (!event) return;
    this.#dialogRouter.navRelative([`${event}`]);
  }
}

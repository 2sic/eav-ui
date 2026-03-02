import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { RestApiHelpTextComponent } from '../../shared/components/rest-api-help-text/rest-api-help-text';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { syncFormWithLastUrlSegment } from '../helper/sync-form-with-last-url-segment';
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
    RestApiHelpTextComponent,
  ],
  templateUrl: './data-rest-api.html'
})
export class DataRestApiComponent {
  #contentTypesSvc = transient(ContentTypesService);
  #dialogRouter = transient(DialogRoutingService);

  #formBuilder = inject(FormBuilder);

  constructor() {
    syncFormWithLastUrlSegment(this.#dialogRouter, {
      items: () => this.contentTypes(),
      control: () => this.contentTypeForm.get('contentType'),
      itemKey: ct => ct.NameId,
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

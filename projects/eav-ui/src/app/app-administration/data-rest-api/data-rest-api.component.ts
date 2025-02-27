import { Component, computed } from '@angular/core';
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

  #getAllContentTypes = this.#contentTypesSvc.getTypesSig("Default", undefined);

  contentTypes = computed(() => {
    const contentTypes = this.#getAllContentTypes();

    const urlSegments = this.#dialogRouter.url.split('/');
    const urlStaticName = urlSegments[urlSegments.length - 1]

    const selectedContentType = contentTypes?.find(contentType => contentType.NameId === urlStaticName);
    if (selectedContentType)
      this.contentTypeForm.get('contentType').setValue(selectedContentType.NameId);

    return contentTypes;
  });

  contentTypeForm: FormGroup = this.fb.group({
    contentType: ['']
  });

  constructor(private fb: FormBuilder,) { }

  openRestApi(event: string): void {
    if (!event) return;
    this.#dialogRouter.navRelative([`${event}`]);
  }
}

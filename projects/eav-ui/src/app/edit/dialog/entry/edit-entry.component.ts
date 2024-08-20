import { Component, OnInit } from '@angular/core';
import { EditDialogMainComponent } from '../main/edit-dialog-main.component';
import { RouterOutlet } from '@angular/router';
import { FormDataService } from '../../shared/services/form-data.service';
import { Context } from '../../../shared/services/context';
import { EditInitializerService } from '../../state/edit-initializer.service';
import { FormConfigService } from '../../state/form-config.service';
import { ScriptsLoaderService } from '../../shared/services/scripts-loader.service';
import { AdamService } from '../../shared/services/adam.service';
import { LoggingService } from '../../shared/services/logging.service';
import { EntityService } from '../../shared/services/entity.service';
import { QueryService } from '../../shared/services/query.service';

/**
 * This component is the entry point for every edit dialog.
 * It initializes the form data and the form itself.
 *
 * Each edit-entry can show multiple entities, as the form can contain multiple sections each having an entity.
 * But if a sub-dialog is opened, this will start anew, with it's own provided services etc.
 */
@Component({
  selector: 'app-edit-entry',
  templateUrl: './edit-entry.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    EditDialogMainComponent,
  ],
  providers: [ // must be by Providers
    LoggingService,
    EditInitializerService,
    FormDataService,

    // 2dm activating...
    Context,              // Form context, such as what app etc. - the same for the entire form
    FormConfigService,    // form configuration valid for this entire form; will be initialized by the EditInitializerService

    AdamService,          // helper to get files, folders etc.
    ScriptsLoaderService, // for loading external scripts
    EntityService,        // for loading entities
    QueryService,         // for loading queries, also needed by the EntityService
  ],
})
export class EditEntryComponent implements OnInit {

  constructor(protected editInitializerService: EditInitializerService) { }

  ngOnInit(): void {
    this.editInitializerService.fetchFormData();
  }
}

import { Component, OnInit } from '@angular/core';
import { EditDialogMainComponent } from '../main/edit-dialog-main.component';
import { RouterOutlet } from '@angular/router';
import { Context } from '../../../shared/services/context';
import { EditInitializerService } from '../../form/edit-initializer.service';
import { FormConfigService } from '../../form/form-config.service';
import { ScriptsLoaderService } from '../../shared/services/scripts-loader.service';
import { LoggingService } from '../../shared/services/logging.service';
import { FeaturesScopedService } from '../../../features/features-scoped.service';

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
  providers: [
    // must be by Providers
    LoggingService,

    // Shared Services across the edit form
    FeaturesScopedService,    // for checking if features are enabled - this can change from dialog to dialog
    EditInitializerService,   // for loading the data and having it ready downstream
    Context,                  // Form context, such as what app etc. - the same for the entire form
    FormConfigService,        // form configuration valid for this entire form; will be initialized by the EditInitializerService
    ScriptsLoaderService,     // Loader for external scripts. Shared as it keeps track of what's been loaded. Maybe should be providedIn: 'root'?
  ],
})
export class EditEntryComponent implements OnInit {

  constructor(protected editInitializerService: EditInitializerService, temp: FeaturesScopedService) { }

  ngOnInit(): void {
    // Load the data - when it's loaded, the HTML will show the rest
    this.editInitializerService.fetchFormData();
  }
}

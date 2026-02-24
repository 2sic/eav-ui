import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { transient } from 'projects/core';
import { classLog } from '../../../../../../shared/logging';
import { FeaturesService } from '../../../features/features.service';
import { Context } from '../../../shared/services/context';
import { EditInitializerService } from '../../form/edit-initializer.service';
import { FormConfigService } from '../../form/form-config.service';
import { InitialValuesService } from '../../form/initial-values-service';
import { LoggingService } from '../../shared/services/logging.service';
import { ScriptsLoaderService } from '../../shared/services/scripts-loader.service';
import { EditDialogMainComponent } from '../main/edit-dialog-main';

/**
 * This component is the entry point for every edit dialog.
 * It initializes the form data and the form itself.
 *
 * Each edit-entry can show multiple entities, as the form can contain multiple sections each having an entity.
 * But if a sub-dialog is opened, this will start anew, with it's own provided services etc.
 */
@Component({
  selector: 'app-edit-entry',
  templateUrl: './edit-entry.html',
  imports: [
    RouterOutlet,
    EditDialogMainComponent,
  ],
  providers: [
    // must be by Providers
    LoggingService,
    // Shared Services across the edit form
    FeaturesService, // for checking if features are enabled - this can change from dialog to dialog
    Context, // Form context, such as what app etc. - the same for the entire form
    FormConfigService, // form configuration valid for this entire form; will be initialized by the EditInitializerService
    ScriptsLoaderService, // Loader for external scripts. Shared as it keeps track of what's been loaded. Maybe should be providedIn: 'root'?
    InitialValuesService, // for preserving initial values for formulas.
  ]
})
export class EditEntryComponent implements OnInit {

  log = classLog({ EditEntryComponent });

  protected editInitializerService = transient(EditInitializerService);

  constructor(temp: FeaturesService) {
    this.log.aIf('constructor');
  }

  ngOnInit(): void {
    // Load the data - when it's loaded, the HTML will show the rest
    this.editInitializerService.fetchFormData();
  }
}

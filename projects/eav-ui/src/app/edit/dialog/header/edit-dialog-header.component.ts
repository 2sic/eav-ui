import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, input, output, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { openFeaturesUsedButUnlicensedDialog } from '../../../features/features-used-but-missing-dialog/features-used-but-unlicensed-dialog.component';
import { FeaturesService } from '../../../features/features.service';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { FormConfigService } from '../../form/form-config.service';
import { FormPublishingService } from '../../form/form-publishing.service';
import { FormsStateService } from '../../form/forms-state.service';
import { LanguageService } from '../../localization/language.service';
import { LanguageSwitcherComponent } from './language-switcher/language-switcher.component';
import { PublishStatusDialogComponent } from './publish-status-dialog/publish-status-dialog.component';

@Component({
    selector: 'app-edit-dialog-header',
    templateUrl: './edit-dialog-header.component.html',
    styleUrls: ['./edit-dialog-header.component.scss'],
    imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        LanguageSwitcherComponent,
        UpperCasePipe,
        TranslateModule,
        TippyDirective,
    ]
})
export class EditDialogHeaderComponent {
  disabled = input<boolean>();
  protected closeDialog = output<void>();

  #formsStateSvc = inject(FormsStateService);
  #features = inject(FeaturesService);

  constructor(
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageService: LanguageService,
    private publishStatusService: FormPublishingService,
    public formConfig: FormConfigService,
  ) { }

  protected config = this.formConfig.config;
  protected readOnly = this.#formsStateSvc.readOnly;
  protected publishMode = this.publishStatusService.getPublishMode(this.formConfig.config.formId)

  protected hasLanguages = computed(() => {
    const languages = this.languageService.getAllSignal();
    return languages().length > 0
  });

  protected showLicenseWarning = this.#features.hasUnlicensedFeatures;

  close() {
    this.closeDialog.emit();
  }

  openPublishStatusDialog() {
    this.matDialog.open(PublishStatusDialogComponent, {
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
      width: '350px',
    });
  }

  openUnlicensedDialog() {
    openFeaturesUsedButUnlicensedDialog(this.matDialog, this.viewContainerRef);
  }
}

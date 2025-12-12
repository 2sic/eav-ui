import { Component, inject } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from "@angular/material/select";
import { TranslateModule } from "@ngx-translate/core";
import { SaveCloseButtonFabComponent } from "projects/eav-ui/src/app/shared/modules/save-close-button-fab/save-close-button-fab";
import { UserLanguageService } from "projects/eav-ui/src/app/shared/services/user-language.service";
import { transient } from '../../../../../../../core/transient';
import { TippyDirective } from "../../../../shared/directives/tippy.directive";
import { LanguageService } from '../../../localization/language.service';
import { isCtrlEnter } from "../../main/keyboard-shortcuts";
import { getLanguageOptions } from '../language-switcher/language-switcher.helpers';
import { LanguageDropdownComponent } from "./LanguageDropdown/language-dropdown";
import { LanguagePart } from "./LanguageDropdown/language-part.enum";

@Component({
  selector: 'app-separate-languages-header',
  templateUrl: './language-settings-dialog.html',
  styleUrls: ['./language-settings-dialog.scss'],
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    TippyDirective,
    MatFormFieldModule,
    MatSelectModule,
    LanguageDropdownComponent,
    TranslateModule,
    SaveCloseButtonFabComponent,
  ]
})
export class LanguageSettingsDialogComponent {
  /** Language SVC - to get list of all possible languages */
  #languageSvc = inject(LanguageService);

  LanguagePart = LanguagePart;

  /** User language service - to get/set the current language */
  protected userLanguageSvc = transient(UserLanguageService);

  /** Dialog reference, for close */
  protected dialog = inject(MatDialogRef<LanguageSettingsDialogComponent>);
  
  protected options = getLanguageOptions(this.#languageSvc.getAll());

  constructor() { }
  
  ngOnInit() {
    this.#watchKeyboardShortcuts();
  }

  get selectedValue(): boolean {
    return !!this.userLanguageSvc.primaryTranslatableEnabled();
  }

  onSelectionChange(event: any) {
    this.userLanguageSvc.savePrimaryTranslatable(!!event.value);
  }

  closeDialog() {
    this.dialog.close();
  }

  #watchKeyboardShortcuts(): void {
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlEnter(event)) {
        event.preventDefault();
        this.closeDialog();
      }
    });
  }
}
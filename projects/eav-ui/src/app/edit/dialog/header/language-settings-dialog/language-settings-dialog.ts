import { Component, inject } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from "@angular/material/select";
import { UserLanguageService } from "projects/eav-ui/src/app/shared/services/user-language.service";
import { TippyDirective } from "../../../../shared/directives/tippy.directive";
import { LanguageService } from '../../../localization/language.service';
import { getLanguageOptions } from '../language-switcher/language-switcher.helpers';

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
  ]
})
export class LanguageSettingsDialogComponent {

  #languageSvc = inject(LanguageService);
  #userLanguageSvc = inject(UserLanguageService);

  constructor(protected dialog: MatDialogRef<LanguageSettingsDialogComponent>) { }
  
  protected options = getLanguageOptions(this.#languageSvc.getAll());

  setLabelLanguage(selectedLang: string, type: string): void {
    this.#userLanguageSvc.setLabel(selectedLang);
  }

  getLabelLanguage(): String {
    return this.#userLanguageSvc.getLabelStored();
  }

  setUiLanguage(selectedLang: string, type: string): void {
    this.#userLanguageSvc.setUi(selectedLang);
  }

  getUiLanguage(): String {
    return this.#userLanguageSvc.getUiStored();
  }
}

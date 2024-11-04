import { Component } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from "@angular/material/select";
import { UserLanguageService } from "projects/eav-ui/src/app/shared/services/user-language.service";
import { TippyDirective } from "../../../../shared/directives/tippy.directive";
import { LanguageService } from '../../../localization/language.service';
import { getLanguageOptions } from '../language-switcher/language-switcher.helpers';

@Component({
  selector: 'app-separate-languages-header',
  templateUrl: './separate-languages-dialog.html',
  styleUrls: ['./separate-languages-dialog.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIconModule,
    MatButtonModule,
    TippyDirective,
    MatFormFieldModule,
    MatSelectModule,
  ],
})
export class SeparateLanguagesDialogComponent {

  constructor(
    private languageSvc: LanguageService,
    private userLanguageSvc: UserLanguageService,
  ) { }

  protected options = getLanguageOptions(this.languageSvc.getAll());

  setLabelLanguage(selectedLang: string, type: string): void {
    this.userLanguageSvc.setLabelLanguage(selectedLang);
  }

  getLabelLanguage(): String {
    return this.userLanguageSvc.getLabelLanguage();
  }

  setUiLanguage(selectedLang: string, type: string): void {
    this.userLanguageSvc.setUiLanguage(selectedLang);
  }

  getUiLanguage(): String {
    return this.userLanguageSvc.getUiLanguage();
  }
}

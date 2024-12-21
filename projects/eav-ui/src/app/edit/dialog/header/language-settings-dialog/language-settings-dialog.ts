import { Component, inject } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from "@angular/material/select";
import { TranslateModule } from "@ngx-translate/core";
import { UserLanguageService } from "projects/eav-ui/src/app/shared/services/user-language.service";
import { transient } from '../../../../../../../core/transient';
import { TippyDirective } from "../../../../shared/directives/tippy.directive";
import { LanguageService } from '../../../localization/language.service';
import { getLanguageOptions } from '../language-switcher/language-switcher.helpers';
import { LanguageDropdownComponent } from "./LanguageDropdownComponent/language-dropdown.component";

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
  ]
})
export class LanguageSettingsDialogComponent {

  /** Language SVC - to get list of all possible languages */
  #languageSvc = inject(LanguageService);

  /** User language service - to get/set the current language */
  protected userLanguageSvc = transient(UserLanguageService);

  /** Dialog reference, for close */
  protected dialog = inject(MatDialogRef<LanguageSettingsDialogComponent>);

  constructor() { }

  protected options = getLanguageOptions(this.#languageSvc.getAll());
}

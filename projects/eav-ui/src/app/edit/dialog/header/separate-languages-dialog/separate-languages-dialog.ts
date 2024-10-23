import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UserLanguageService } from "projects/eav-ui/src/app/shared/services/user-language.service";
import { TippyDirective } from "../../../../shared/directives/tippy.directive";
import { FormConfigService } from "../../../form/form-config.service";
import { FormLanguageService } from "../../../form/form-language.service";
import { LanguageService } from "../../../localization/language.service";

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
  ],
})
export class SeparateLanguagesDialogComponent implements OnInit {

  primaryLang: string;
  currentLang: string;
  initialLang: string;

  constructor(
    private userLanguageService: UserLanguageService,
    private languageService: LanguageService,
    private formConfigService: FormConfigService,
    private formLanguageService: FormLanguageService,
  ) { }

  ngOnInit(): void {
    const formLanguage = this.formLanguageService.getLanguage(this.formConfigService.config.formId)();
    this.primaryLang = formLanguage.primary;
    this.currentLang = formLanguage.current;
    this.initialLang = formLanguage.initial;
  }
}

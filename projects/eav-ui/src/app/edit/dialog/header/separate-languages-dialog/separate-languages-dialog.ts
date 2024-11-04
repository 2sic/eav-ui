import { Component, OnInit } from "@angular/core";
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
import { FormConfigService } from "../../../form/form-config.service";
import { FormLanguageService } from "../../../form/form-language.service";

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
export class SeparateLanguagesDialogComponent implements OnInit {

  primaryLang: string;
  currentLang: string;
  initialLang: string;

  constructor(
    private formConfigService: FormConfigService,
    private formLanguageService: FormLanguageService,
    private userLanguageService: UserLanguageService,
  ) { }

  ngOnInit(): void {
    const formLanguage = this.formLanguageService.getSignal(this.formConfigService.config.formId)();

    this.primaryLang = formLanguage.primary;
    this.currentLang = formLanguage.current;
    this.initialLang = formLanguage.initial;
  }

  setLabelLanguage(selectedLang: string, type: string): void {
    this.userLanguageService.setLabelLanguage(selectedLang);
  }

  getLabelLanguage(): String {
    return this.userLanguageService.getLabelLanguage();
  }

  setUiLanguage(selectedLang: string, type: string): void {
    this.userLanguageService.setUiLanguage(selectedLang);
  }

  getUiLanguage(): String {
    return this.userLanguageService.getUiLanguage();
  }
}

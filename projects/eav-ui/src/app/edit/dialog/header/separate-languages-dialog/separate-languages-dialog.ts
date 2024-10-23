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

  uiLanguage: string;
  contentLanguage: string;

  constructor(private languageService: UserLanguageService) { }

  ngOnInit(): void {
    this.uiLanguage = this.languageService.getUILanguage();
    this.contentLanguage = this.languageService.getContentLanguage();
  }
}

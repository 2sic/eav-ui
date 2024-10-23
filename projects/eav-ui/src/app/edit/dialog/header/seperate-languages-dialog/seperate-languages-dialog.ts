import { Component } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from "../../../../shared/directives/tippy.directive";

@Component({
  selector: 'app-seperate-languages-header',
  templateUrl: './seperate-languages-dialog.html',
  styleUrls: ['./seperate-languages-dialog.scss'],
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
export class SeperateLanguagesDialogComponent {

  constructor() { }
}

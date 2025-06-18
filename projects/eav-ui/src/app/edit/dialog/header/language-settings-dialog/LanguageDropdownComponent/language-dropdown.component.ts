
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';

@Component({
  selector: 'app-language-dropdown',
  templateUrl: './language-dropdown.component.html',
  imports: [
    MatFormFieldModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    TippyDirective,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule
]
})
export class LanguageDropdownComponent {
  @Input() label: string;
  @Input() tooltip: string;
  @Input() optionType: string;
  @Input() options: any[];
  @Input() userLanguageSvc: any;

  constructor() { }

  get selectedValue() {
    return this.userLanguageSvc.isForced(this.optionType) 
      ? this.userLanguageSvc.value(this.optionType) 
      : this.userLanguageSvc.stored(this.optionType);
  }

  onSelectionChange(event: any) {
    this.userLanguageSvc.save(this.optionType, event.value);
  }
}
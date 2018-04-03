import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';

@Component({
  selector: 'app-eav-language-switcher',
  templateUrl: './eav-language-switcher.component.html',
  styleUrls: ['./eav-language-switcher.component.css']
})
export class EavLanguageSwitcherComponent {
  @Input() languages = ['English',
    'German',
    'Spanish',
    'French',
    'Croatian'];
}

import { Component, OnInit, Input } from '@angular/core';
import { MatInput } from '@angular/material';
import { FormGroup } from '@angular/forms';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { Observable } from 'rxjs/Observable';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-font-icon-picker',
  templateUrl: './string-font-icon-picker.component.html',
  styleUrls: ['./string-font-icon-picker.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class StringFontIconPickerComponent implements Field, OnInit {
  @Input() config: FieldConfig;
  group: FormGroup;

  // icons$: [{ rule: CSSStyleSheet, 'class': string }] = ;
  icons = [];

  ngOnInit() {
    this.getIconClasses('.glyphicon-');
  }

  get value() {
    return this.group.controls[this.config.name].value;
  }

  setIcon(iconClass: any, formControlName: string) {
    this.group.patchValue({ [formControlName]: iconClass });
  }

  getIconClasses(className) {
    const charcount = className.length, foundList = [], duplicateDetector = {};

    if (!className) {
      return foundList;
    }


    for (let ssSet = 0; ssSet < document.styleSheets.length; ssSet++) {
      // const classes = document.styleSheets[ssSet].rules || document.styleSheets[ssSet].cssRules;
      // TEMP: look only bootstrap-glyphicons.css
      if ((<CSSStyleSheet>document.styleSheets[ssSet]).href === 'http://localhost:4200/assets/style/bootstrap-glyphicons.css') {

        console.log('aaa', (<CSSStyleSheet>document.styleSheets[ssSet]).rules);
        const classes = (<CSSStyleSheet>document.styleSheets[ssSet]).rules;

        if (classes) {
          for (let x = 0; x < classes.length; x++) {
            if ((<CSSStyleRule>classes[x]).selectorText && (<CSSStyleRule>classes[x]).selectorText.substring(0, charcount) === className) {
              // prevent duplicate-add...
              const txt = (<CSSStyleRule>classes[x]).selectorText,
                icnClass = txt.substring(0, txt.indexOf(':')).replace('.', '');
              if (!duplicateDetector[icnClass]) {
                foundList.push({ rule: classes[x], 'class': icnClass });
                duplicateDetector[icnClass] = true;
              }
            }
          }
        }
      }
    }
    // this.icons$ = foundList;
    this.icons.push(...foundList);
    // return foundList;
  }
}

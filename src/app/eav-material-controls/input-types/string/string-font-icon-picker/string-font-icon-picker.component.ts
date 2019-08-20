import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { ScriptsLoaderService } from '../../../../shared/services/scripts-loader.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-font-icon-picker',
  templateUrl: './string-font-icon-picker.component.html',
  styleUrls: ['./string-font-icon-picker.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class StringFontIconPickerComponent implements Field, OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  group: FormGroup;

  icons = [];
  // filteredIcons: Observable<{ rule: CSSStyleRule, class: string }>;
  filteredIcons: Observable<any>;
  private subscriptions: Subscription[] = [];

  get files(): string {
    return this.config.field.settings.Files ? this.config.field.settings.Files : '';
  }

  get prefix(): string {
    return this.config.field.settings.CssPrefix ? this.config.field.settings.CssPrefix : '';
  }

  get previewCss(): string {
    return this.config.field.settings.PreviewCss ? this.config.field.settings.PreviewCss : '';
  }

  get value() {
    return this.group.controls[this.config.field.name].value;
  }

  get inputInvalid() {
    return this.group.controls[this.config.field.name].invalid;
  }

  constructor(
    private scriptsLoaderService: ScriptsLoaderService,
    private validationMessagesService: ValidationMessagesService,
  ) { }

  ngOnInit() {
    this.loadAdditionalResources(this.files);
    this.filteredIcons = this.getFilteredIcons();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  getIconClasses(className) {
    const charcount = className.length, foundList = [], duplicateDetector = {};

    if (!className) {
      return foundList;
    }

    for (let ssSet = 0; ssSet < document.styleSheets.length; ssSet++) {
      try {
        const classes = (<CSSStyleSheet>document.styleSheets[ssSet]).rules || (<CSSStyleSheet>document.styleSheets[ssSet]).cssRules;
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
      } catch (error) {
        // try catch imortant because can't find CSSStyleSheet rules error
        console.log('Icon picker CSSStyleSheet error: ', error);
      }
    }

    return foundList;
  }

  private loadAdditionalResources(files: string) {
    this.scriptsLoaderService.load(files.split('\n'), this.iconsLoaded.bind(this));
  }

  private iconsLoaded() {
    this.icons = this.getIconClasses(this.prefix);
  }

  setIcon(iconClass: any, formControlName: string) {
    this.group.patchValue({ [formControlName]: iconClass });
  }

  /**
  *  with update on click trigger value change to open autocomplete
  */
  update() {
    this.group.controls[this.config.field.name].patchValue(this.value);
  }

  private filterStates(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.icons.filter(icon => icon.class.toLowerCase().indexOf(filterValue) >= 0);
  }

  private getFilteredIcons = () => {
    return this.group.controls[this.config.field.name].valueChanges
      .pipe(
        startWith(''),
        map(icon => icon ? this.filterStates(icon) : this.icons.slice())
      );
  }
}

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { ScriptsLoaderService } from '../../../../shared/services/scripts-loader.service';
import { StringFontIconPickerIcon } from '../../../../shared/models/input-types/string-font-icon-picker-icon';

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
  @Input() group: FormGroup;

  icons: StringFontIconPickerIcon[] = [];
  filteredIcons: Observable<StringFontIconPickerIcon[]>;

  private subscriptions: Subscription[] = [];

  get files(): string { return this.config.field.settings.Files ? this.config.field.settings.Files : ''; }
  get prefix(): string { return this.config.field.settings.CssPrefix ? this.config.field.settings.CssPrefix : ''; }
  get previewCss(): string { return this.config.field.settings.PreviewCss ? this.config.field.settings.PreviewCss : ''; }
  get value() { return this.group.controls[this.config.field.name].value; }
  get inputInvalid() { return this.group.controls[this.config.field.name].invalid; }

  constructor(private scriptsLoaderService: ScriptsLoaderService) { }

  ngOnInit() {
    this.loadAdditionalResources(this.files);
    this.filteredIcons = this.getFilteredIcons();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }

  getIconClasses(className: string) {
    const foundList: { rule: CSSRule; class: string; }[] = [];
    const duplicateDetector: { [key: string]: boolean } = {};

    if (!className) { return foundList; }

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i] as CSSStyleSheet;
      if (!sheet) { continue; }

      let rules: CSSRuleList;
      try {
        rules = sheet.rules;
      } catch (error) { /* errors happens if browser denies access to css rules */ }
      if (!rules) {
        try {
          rules = sheet.cssRules;
        } catch (error) { /* errors happens if browser denies access to css rules */ }
      }
      if (!rules) { continue; }

      // tslint:disable-next-line:prefer-for-of
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j] as CSSStyleRule;
        if (!(rule.selectorText && rule.selectorText.startsWith(className))) { continue; }

        const selector = rule.selectorText;
        const iconClass = selector.substring(0, selector.indexOf(':')).replace('.', '');
        if (duplicateDetector[iconClass]) { continue; }

        foundList.push({ rule, class: iconClass });
        duplicateDetector[iconClass] = true;
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

  /** With update on click trigger value change to open autocomplete */
  update() {
    this.group.controls[this.config.field.name].patchValue(this.value);
  }

  private filterStates(value: string): StringFontIconPickerIcon[] {
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

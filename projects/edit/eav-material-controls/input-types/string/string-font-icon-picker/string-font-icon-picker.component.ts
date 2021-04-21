import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService, FieldsSettingsService, ScriptsLoaderService } from '../../../../shared/services';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { StringFontIconPickerLogic } from './string-font-icon-picker-logic';
import { findAllIconsInCss } from './string-font-icon-picker.helpers';
import { IconOption, StringFontIconPickerTemplateVars } from './string-font-icon-picker.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-font-icon-picker',
  templateUrl: './string-font-icon-picker.component.html',
  styleUrls: ['./string-font-icon-picker.component.scss'],
})
@ComponentMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringFontIconPickerComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<StringFontIconPickerTemplateVars>;

  private iconOptions$: BehaviorSubject<IconOption[]>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    private scriptsLoaderService: ScriptsLoaderService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
    StringFontIconPickerLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.iconOptions$ = new BehaviorSubject<IconOption[]>([]);
    this.subscription.add(
      this.settings$.subscribe(settings => {
        const files = settings.Files;
        const cssPrefix = settings.CssPrefix;
        const showPrefix = settings.ShowPrefix;
        // load each file (usually CSS) in the settings
        this.scriptsLoaderService.load(files.split('\n'), () => {
          const newIconOptions = findAllIconsInCss(cssPrefix, showPrefix);
          this.iconOptions$.next(newIconOptions);
        });
      })
    );
    const previewCss$ = this.settings$.pipe(map(settings => settings.PreviewCss));
    const filteredIcons$ = combineLatest([this.value$, this.iconOptions$]).pipe(
      map(([search, iconList]) => {
        // if we have a filter param, use it, otherwise don't filter
        const filtered = search
          ? iconList.filter(icon => icon.search?.includes(search.toLowerCase()) ?? false)
          : iconList;
        return filtered;
      }),
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.value$, filteredIcons$, previewCss$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.disabled$, this.touched$]),
    ]).pipe(
      map(([
        [value, filteredIcons, previewCss, label, placeholder, required],
        [disabled, touched],
      ]) => {
        const templateVars: StringFontIconPickerTemplateVars = {
          value,
          filteredIcons,
          previewCss,
          label,
          placeholder,
          required,
          disabled,
          touched,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    this.iconOptions$.complete();
    super.ngOnDestroy();
  }
}

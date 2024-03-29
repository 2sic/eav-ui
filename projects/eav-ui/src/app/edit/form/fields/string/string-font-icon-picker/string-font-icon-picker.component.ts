import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService, ScriptsLoaderService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { StringFontIconPickerLogic } from './string-font-icon-picker-logic';
import { findAllIconsInCss } from './string-font-icon-picker.helpers';
import { IconOption, StringFontIconPickerViewModel } from './string-font-icon-picker.models';

@Component({
  selector: InputTypeConstants.StringFontIconPicker,
  templateUrl: './string-font-icon-picker.component.html',
  styleUrls: ['./string-font-icon-picker.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringFontIconPickerComponent extends BaseFieldComponent<string> implements OnInit, OnDestroy {
  viewModel: Observable<StringFontIconPickerViewModel>;

  private iconOptions$: BehaviorSubject<IconOption[]>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService, private scriptsLoaderService: ScriptsLoaderService) {
    super(eavService, fieldsSettingsService);
    StringFontIconPickerLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.iconOptions$ = new BehaviorSubject<IconOption[]>([]);

    this.subscription.add(
      this.settings$.pipe(
        map(settings => ({
          Files: settings.Files,
          CssPrefix: settings.CssPrefix,
          ShowPrefix: settings.ShowPrefix,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ).subscribe(settings => {
        // load each file (usually CSS) in the settings
        this.scriptsLoaderService.load(settings.Files.split('\n'), () => {
          const newIconOptions = findAllIconsInCss(settings.CssPrefix, settings.ShowPrefix);
          this.iconOptions$.next(newIconOptions);
        });
      })
    );

    const previewCss$ = this.settings$.pipe(map(settings => settings.PreviewCss), distinctUntilChanged());
    const filteredIcons$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()),
      this.iconOptions$,
    ]).pipe(
      map(([search, iconList]) => {
        // if we have a filter param, use it, otherwise don't filter
        const filtered = search
          ? iconList.filter(icon => icon.search?.includes(search.toLocaleLowerCase()) ?? false)
          : iconList;
        return filtered;
      }),
    );

    this.viewModel = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([filteredIcons$, previewCss$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [filteredIcons, previewCss],
      ]) => {
        const viewModel: StringFontIconPickerViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
          filteredIcons,
          previewCss,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    this.iconOptions$.complete();
    super.ngOnDestroy();
  }
}

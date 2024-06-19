import { Component, computed, effect, inject, Injector, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { ScriptsLoaderService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { StringFontIconPickerLogic } from './string-font-icon-picker-logic';
import { findAllIconsInCss } from './string-font-icon-picker.helpers';
import { IconOption } from './string-font-icon-picker.models';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { MatOptionModule } from '@angular/material/core';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';
import { ControlStatus } from '../../../../shared/models';

@Component({
  selector: InputTypeConstants.StringFontIconPicker,
  templateUrl: './string-font-icon-picker.component.html',
  styleUrls: ['./string-font-icon-picker.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    MatOptionModule,
    FieldHelperTextComponent,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class StringFontIconPickerComponent extends BaseFieldComponent<string> implements OnInit, OnDestroy {

  protected fieldState = inject(FieldState);

  protected groupFileState = this.fieldState.group;
  protected configFileState = this.fieldState.config;
  protected controlStatusTemp = this.fieldState.controlStatus as Signal<ControlStatus<string>>;

  protected settingsFileState = this.fieldState.settings;
  protected basicsFileState = this.fieldState.basics;

  protected previewCss = computed(() => this.settingsFileState().PreviewCss, SignalHelpers.stringEquals);

  private iconOptions = signal<IconOption[]>([], { equal: RxHelpers.arraysEqual });

  filteredIcons = computed(() => {
    const search = this.controlStatus().value;
    const filtered = search
      ? this.iconOptions().filter(icon => icon.search?.includes(search.toLocaleLowerCase()) ?? false)
      : this.iconOptions();
    return filtered;
  });

  private injector = inject(Injector);

  constructor(private scriptsLoaderService: ScriptsLoaderService) {
    super();
    StringFontIconPickerLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();

    const fileLoadSettings = computed(() => {
      const s = this.settingsFileState();
      return {
        Files: s.Files,
        CssPrefix: s.CssPrefix,
        ShowPrefix: s.ShowPrefix,
      };
    }, { equal: RxHelpers.objectsEqual });

    effect(() => {
      const settings = fileLoadSettings();
      this.scriptsLoaderService.load(settings.Files.split('\n'), () => {
        const newIconOptions = findAllIconsInCss(settings.CssPrefix, settings.ShowPrefix);
        this.iconOptions.set(newIconOptions);
      });
    }, { allowSignalWrites: true, injector: this.injector });
  }
}

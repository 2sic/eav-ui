import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, effect, inject, Injector } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { getWith } from '../../../../../../../core/object-utilities';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { ScriptsLoaderService } from '../../../shared/services/scripts-loader.service';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { StringFontIconPickerLogic } from './string-font-icon-picker-logic';
import { findAllIconsInCss } from './string-font-icon-picker.helpers';
import { IconOption } from './string-font-icon-picker.models';

@Component({
  selector: InputTypeCatalog.StringFontIconPicker,
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
export class StringFontIconPickerComponent {

  #fieldState = inject(FieldState) as FieldState<string>;
  #injector = inject(Injector);

  constructor(private scriptsLoaderService: ScriptsLoaderService) {
    StringFontIconPickerLogic.importMe();
  }

  protected group = this.#fieldState.group;
  protected config = this.#fieldState.config;
  protected uiValue = this.#fieldState.uiValue;

  #settings = this.#fieldState.settings;
  protected basics = this.#fieldState.basics;

  protected previewCss = this.#fieldState.setting('PreviewCss');

  /** The possible icons before filtering */
  #iconOptions = signalObj<IconOption[]>('iconOptions', []);

  /** The icons after filtering */
  protected filteredIcons = computedObj<IconOption[]>('filteredIcons', () => {
    const search = this.uiValue();
    const filtered = search
      ? this.#iconOptions().filter(icon => icon.search?.includes(search.toLocaleLowerCase()) ?? false)
      : this.#iconOptions();
    return filtered;
  });

  /**
   * Loading icons is done in an effect, because it relies on a callback
   */
  ngOnInit() {
    // Get Relevant settings and make debounce so it only fires if these change
    const fileLoadSettings = computedObj('fileLoadSettings', () => getWith(this.#settings(), s => ({
      Files: s.Files,
      CssPrefix: s.CssPrefix,
      ShowPrefix: s.ShowPrefix,
    })));

    // run effect to load the icons when ready
    effect(() => {
      const settings = fileLoadSettings();
      this.scriptsLoaderService.load(settings.Files.split('\n'), () => {
        const newIconOptions = findAllIconsInCss(settings.CssPrefix, settings.ShowPrefix);
        this.#iconOptions.set(newIconOptions);
      });
    }, { allowSignalWrites: true, injector: this.#injector });
  }
}

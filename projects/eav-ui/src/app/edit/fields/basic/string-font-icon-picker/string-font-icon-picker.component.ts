import { Component, computed, effect, inject, Injector, Signal, signal } from '@angular/core';
import { StringFontIconPickerLogic } from './string-font-icon-picker-logic';
import { findAllIconsInCss } from './string-font-icon-picker.helpers';
import { IconOption } from './string-font-icon-picker.models';
import { MatOptionModule } from '@angular/material/core';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { RxHelpers } from '../../../../shared/rxJs/rx.helpers';
import { ScriptsLoaderService } from '../../../shared/services/scripts-loader.service';
import { ControlStatus } from '../../../shared/models/control-status.model';

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

  protected group = this.#fieldState.group;
  protected config = this.#fieldState.config;
  protected uiValue = this.#fieldState.uiValue;

  #settings = this.#fieldState.settings;
  protected basics = this.#fieldState.basics;

  protected previewCss = computed(() => this.#settings().PreviewCss, SignalEquals.string);

  #iconOptions = signal<IconOption[]>([], { equal: RxHelpers.arraysEqual });

  filteredIcons = computed(() => {
    const search = this.uiValue();
    const filtered = search
      ? this.#iconOptions().filter(icon => icon.search?.includes(search.toLocaleLowerCase()) ?? false)
      : this.#iconOptions();
    return filtered;
  });

  #injector = inject(Injector);

  constructor(private scriptsLoaderService: ScriptsLoaderService) {
    StringFontIconPickerLogic.importMe();
  }

  ngOnInit() {
    const fileLoadSettings = computed(() => {
      const s = this.#settings();
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
        this.#iconOptions.set(newIconOptions);
      });
    }, { allowSignalWrites: true, injector: this.#injector });
  }
}

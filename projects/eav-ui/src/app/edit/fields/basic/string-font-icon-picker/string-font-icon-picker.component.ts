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
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { ControlStatus } from '../../../shared/models';
import { ScriptsLoaderService } from '../../../shared/services';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { SignalHelpers } from '../../../../shared/helpers/signal.helpers';
import { RxHelpers } from '../../../../shared/rxJs/rx.helpers';

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
export class StringFontIconPickerComponent {

  protected fieldState = inject(FieldState);

  protected group = this.fieldState.group;
  protected config = this.fieldState.config;
  protected controlStatus = this.fieldState.controlStatus as Signal<ControlStatus<string>>;

  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;

  protected previewCss = computed(() => this.settings().PreviewCss, SignalHelpers.stringEquals);

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
    StringFontIconPickerLogic.importMe();
  }

  ngOnInit() {
    const fileLoadSettings = computed(() => {
      const s = this.settings();
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

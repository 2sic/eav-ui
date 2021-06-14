import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../form/builder/eav-field/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { FieldMask, GeneralHelpers, UrlHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { BaseComponent } from '../../base/base.component';
import { StringUrlPathLogic } from './string-url-path-logic';
import { StringUrlPathTemplateVars } from './string-url-path.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-url-path',
  templateUrl: './string-url-path.component.html',
  styleUrls: ['./string-url-path.component.scss'],
})
@ComponentMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringUrlPathComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<StringUrlPathTemplateVars>;

  private fieldMask: FieldMask;
  /** Blocks external update if field was changed manually and doesn't match external updates. WARNING: Doesn't work on language change */
  private lastAutoCopy = '';

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    StringUrlPathLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();

    this.subscription.add(
      this.settings$.pipe(
        map(settings => settings.AutoGenerateMask),
        distinctUntilChanged(),
      ).subscribe(autoGenerateMask => {
        this.fieldMask?.destroy();
        this.fieldMask = new FieldMask(
          autoGenerateMask,
          this.group.controls,
          (newValue) => { this.onSourcesChanged(newValue); },
          // remove slashes which could look like path-parts
          (key, value) => typeof value === 'string' ? value.replace('/', '-').replace('\\', '-') : value,
        );

        this.onSourcesChanged(this.fieldMask.resolve());
      })
    );

    // clean on value change
    this.subscription.add(
      this.control.valueChanges.subscribe(() => {
        this.clean(false);
      })
    );

    this.templateVars$ = combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]).pipe(
      map(([controlStatus, label, placeholder, required]) => {
        const templateVars: StringUrlPathTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    this.fieldMask?.destroy();
    super.ngOnDestroy();
  }

  private onSourcesChanged(newValue: string) {
    const value = this.control.value;
    // don't do anything if the current field is not empty and doesn't have the last copy of the stripped value
    if (value && value !== this.lastAutoCopy) { return; }

    const cleaned = UrlHelpers.stripNonUrlCharacters(newValue, this.settings$.value.AllowSlashes, true);
    if (!cleaned) { return; }
    this.lastAutoCopy = cleaned;
    if (value === cleaned) { return; }
    GeneralHelpers.patchControlValue(this.control, cleaned);
  }

  clean(trimEnd: boolean) {
    const value = this.control.value;
    const cleaned = UrlHelpers.stripNonUrlCharacters(value, this.settings$.value.AllowSlashes, trimEnd);
    if (value === cleaned) { return; }
    GeneralHelpers.patchControlValue(this.control, cleaned);
  }
}

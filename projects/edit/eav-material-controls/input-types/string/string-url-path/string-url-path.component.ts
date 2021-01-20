import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldMaskService } from '../../../../../shared/field-mask.service';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { Helper } from '../../../../shared/helpers/helper';
import { EavService } from '../../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
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

  private autoGenerateMask: string;
  private allowSlashes: boolean;
  private fieldMaskService: FieldMaskService;
  /** Blocks external update if field was changed manually and doesn't match external updates. WARNING: Doesn't work on language change */
  private lastAutoCopy = '';

  constructor(eavService: EavService, validationMessagesService: ValidationMessagesService) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    const settingsLogic = new StringUrlPathLogic();
    this.subscription.add(
      this.settings$.pipe(map(settings => settingsLogic.init(settings))).subscribe(settings => {
        this.autoGenerateMask = settings.AutoGenerateMask;
        this.allowSlashes = settings.AllowSlashes;
        if (this.fieldMaskService != null) {
          this.fieldMaskService.destroy();
          this.fieldMaskService = null;
        }
        this.fieldMaskService = new FieldMaskService(
          this.autoGenerateMask,
          this.group.controls,
          this.onSourcesChanged.bind(this),
          this.preClean,
        );
      })
    );

    // set initial value
    this.onSourcesChanged(this.fieldMaskService.resolve());

    // clean on value change
    this.subscription.add(
      this.control.valueChanges.subscribe(value => {
        this.clean(false);
      })
    );

    this.templateVars$ = combineLatest([this.label$, this.placeholder$, this.required$, this.disabled$, this.showValidation$]).pipe(
      map(([label, placeholder, required, disabled, showValidation]) => {
        const templateVars: StringUrlPathTemplateVars = {
          label,
          placeholder,
          required,
          disabled,
          showValidation,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  private onSourcesChanged(newValue: string) {
    const value = this.control.value;
    // don't do anything if the current field is not empty and doesn't have the last copy of the stripped value
    if (value && value !== this.lastAutoCopy) { return; }

    const cleaned = Helper.stripNonUrlCharacters(newValue, this.allowSlashes, true);
    if (!cleaned) { return; }
    this.lastAutoCopy = cleaned;
    if (value === cleaned) { return; }
    this.control.patchValue(cleaned);
  }

  private preClean(key: string, value: string) {
    return value.replace('/', '-').replace('\\', '-'); // remove slashes which could look like path-parts
  }

  clean(trimEnd: boolean) {
    const value = this.control.value;
    const cleaned = Helper.stripNonUrlCharacters(value, this.allowSlashes, trimEnd);
    if (value === cleaned) { return; }
    this.control.patchValue(cleaned);
  }
}

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Helper } from '../../../../shared/helpers/helper';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { FieldMaskService } from '../../../../../shared/field-mask.service';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-url-path',
  templateUrl: './string-url-path.component.html',
  styleUrls: ['./string-url-path.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class StringUrlPathComponent implements Field, OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  private enableSlashes = true;
  private lastAutoCopy = '';
  private subscriptions: Subscription[] = [];
  private fieldMaskService: FieldMaskService;

  get inputInvalid() { return this.group.controls[this.config.field.name].invalid; }
  get autoGenerateMask(): string { return this.config.field.settings.AutoGenerateMask || null; }

  constructor() { }

  ngOnInit() {
    const sourceMask = this.autoGenerateMask;
    // this will contain the auto-resolve type (based on other contentType-field)
    this.fieldMaskService = new FieldMaskService(sourceMask, this.group.controls, null, this.preCleane);

    // set initial value
    this.sourcesChangedTryToUpdate(this.fieldMaskService);

    // get all mask field and subcribe to changes. On every change sourcesChangedTryToUpdate.
    this.fieldMaskService.fieldList().forEach((e, i) => {
      if (this.group.controls[e]) {
        this.group.controls[e].valueChanges.subscribe((item) => {
          this.sourcesChangedTryToUpdate(this.fieldMaskService);
        });
      }
    });

    // clean on value change
    this.subscriptions.push(
      this.group.controls[this.config.field.name].valueChanges.subscribe((item) => {
        this.clean(this.config.field.name, false);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }

  /** Field-Mask handling */
  private sourcesChangedTryToUpdate(fieldMaskService: FieldMaskService) {
    const formControlValue = this.group.controls[this.config.field.name].value;
    // don't do anything if the current field is not empty and doesn't have the last copy of the stripped value
    if (formControlValue && formControlValue !== this.lastAutoCopy) { return; }

    const orig = fieldMaskService.resolve();
    const cleaned = Helper.stripNonUrlCharacters(orig, this.enableSlashes, true);
    if (cleaned) {
      this.lastAutoCopy = cleaned;
      this.group.controls[this.config.field.name].patchValue(cleaned, { emitEvent: false });
    }
  }

  private preCleane = (key: string, value: string) => {
    return value.replace('/', '-').replace('\\', '-'); // this will remove slashes which could look like path-parts
  }

  clean(formControlName: string, trimEnd: boolean) {
    const formControlValue = this.group.controls[formControlName].value;
    const cleaned = Helper.stripNonUrlCharacters(formControlValue, this.enableSlashes, trimEnd);
    if (formControlValue !== cleaned) {
      this.group.controls[formControlName].patchValue(cleaned, { emitEvent: false });
    }
  }
}

import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { WrappersConstants } from '../../../shared/constants';
import { EavService, FieldsSettingsService } from '../../../shared/services';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseFieldComponent } from '../../fields/base/base-field.component';
import { ItemFieldVisibility } from '../../../shared/services/item-field-visibility';

@Component({
  selector: WrappersConstants.HiddenWrapper,
  templateUrl: './hidden-wrapper.component.html',
  styleUrls: ['./hidden-wrapper.component.scss'],
})
export class HiddenWrapperComponent extends BaseFieldComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  hidden$: Observable<boolean>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.hidden$ = this.settings$.pipe(
      map(settings => !ItemFieldVisibility.mergedVisible(settings)),
      distinctUntilChanged(),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}

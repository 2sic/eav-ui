import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { WrappersConstants } from '../../../shared/constants';
import { FormConfigService, FieldsSettingsService } from '../../../shared/services';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseFieldComponent } from '../../fields/base/base-field.component';
import { ItemFieldVisibility } from '../../../shared/services/item-field-visibility';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: WrappersConstants.HiddenWrapper,
    templateUrl: './hidden-wrapper.component.html',
    styleUrls: ['./hidden-wrapper.component.scss'],
    standalone: true,
    imports: [AsyncPipe],
})
export class HiddenWrapperComponent extends BaseFieldComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  hidden$: Observable<boolean>;

  constructor(fieldsSettingsService: FieldsSettingsService) {
    super(fieldsSettingsService);
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

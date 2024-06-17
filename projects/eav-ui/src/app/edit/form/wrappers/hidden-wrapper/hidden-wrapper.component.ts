import { Component, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef, WritableSignal } from '@angular/core';
import { distinctUntilChanged, map, Observable, Subject } from 'rxjs';
import { WrappersConstants } from '../../../shared/constants';
import { FieldsSettingsService } from '../../../shared/services';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseFieldComponent } from '../../fields/base/base-field.component';
import { ItemFieldVisibility } from '../../../shared/services/item-field-visibility';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FieldSettings } from '../../../../../../../edit-types';

@Component({
  selector: WrappersConstants.HiddenWrapper,
  templateUrl: './hidden-wrapper.component.html',
  styleUrls: ['./hidden-wrapper.component.scss'],
  standalone: true,
  imports: [AsyncPipe],
})
export class HiddenWrapperComponent extends BaseFieldComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  hidden: WritableSignal<boolean> = signal(false);

  constructor(fieldsSettingsService: FieldsSettingsService) {
    super(fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();

    this.settings$.pipe(
      map(settings => !ItemFieldVisibility.mergedVisible(settings)),
      distinctUntilChanged()
    ).subscribe(value => this.hidden.set(value));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}

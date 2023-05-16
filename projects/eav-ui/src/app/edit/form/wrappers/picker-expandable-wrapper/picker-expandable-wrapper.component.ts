import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable, share } from 'rxjs';
import { WrappersConstants } from '../../../shared/constants';
import { EavService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseFieldComponent } from '../../fields/base/base-field.component';
import { ContentExpandAnimation } from '../expandable-wrapper/content-expand.animation';
import { PickerExpandableViewModel } from './picker-expandable-wrapper.models';

@Component({
  selector: WrappersConstants.PickerExpandableWrapper,
  templateUrl: './picker-expandable-wrapper.component.html',
  styleUrls: ['./picker-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
export class PickerExpandableWrapperComponent extends BaseFieldComponent<string | string[]> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  dialogIsOpen$: Observable<boolean>;
  saveButtonDisabled$ = this.formsStateService.saveButtonDisabled$.pipe(share());
  viewModel$: Observable<PickerExpandableViewModel>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private editRoutingService: EditRoutingService,
    private formsStateService: FormsStateService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.dialogIsOpen$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  saveAll(close: boolean) {
    this.formsStateService.saveForm$.next(close);
  }
}

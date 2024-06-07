import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable, distinctUntilChanged, share } from 'rxjs';
import { WrappersConstants } from '../../../shared/constants';
import { FormConfigService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseFieldComponent } from '../../fields/base/base-field.component';
import { ContentExpandAnimation } from '../expandable-wrapper/content-expand.animation';
import { TranslateModule } from '@ngx-translate/core';
import { MatRippleModule } from '@angular/material/core';
import { ExtendedFabSpeedDialModule } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.module';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';

@Component({
    selector: WrappersConstants.PickerExpandableWrapper,
    templateUrl: './picker-expandable-wrapper.component.html',
    styleUrls: ['./picker-expandable-wrapper.component.scss'],
    animations: [ContentExpandAnimation],
    standalone: true,
    imports: [
        NgClass,
        ExtendedModule,
        FlexModule,
        MatCardModule,
        MatButtonModule,
        SharedComponentsModule,
        MatIconModule,
        CdkScrollable,
        ExtendedFabSpeedDialModule,
        MatRippleModule,
        AsyncPipe,
        TranslateModule,
    ],
})
export class PickerExpandableWrapperComponent extends BaseFieldComponent<string | string[]> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('previewComponent', { static: true, read: ViewContainerRef }) previewComponent: ViewContainerRef;

  dialogIsOpen$: Observable<boolean>;
  saveButtonDisabled$ = this.formsStateService.saveButtonDisabled$.pipe(share());

  constructor(
    fieldsSettingsService: FieldsSettingsService,
    private editRoutingService: EditRoutingService,
    private formsStateService: FormsStateService,
  ) {
    super(fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.dialogIsOpen$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);
    this.dialogIsOpen$.pipe(distinctUntilChanged()).subscribe(isOpen => {
      this.fieldsSettingsService.updateSetting(this.config.fieldName, { _isDialog: isOpen });
     });
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

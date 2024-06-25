import { Component, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { distinctUntilChanged } from 'rxjs';
import { WrappersConstants } from '../../../shared/constants';
import { EditRoutingService, FormsStateService } from '../../../shared/services';
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
import { NgClass } from '@angular/common';
import { FieldControlConfig } from '../../builder/fields-builder/field-config-set.model';

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
    TranslateModule,
  ],
})
export class PickerExpandableWrapperComponent extends BaseFieldComponent<string | string[]> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('previewComponent', { static: true, read: ViewContainerRef }) previewComponent: ViewContainerRef;

  dialogIsOpen = signal(false);

  // /**
  //  * WIP - this is set by the field builder to determine if the view mode should be open/closed on this specific control
  //  * since the same control can be used in the dialog but also in the form directly
  //  */
  // controlConfig: FieldControlConfig = {};

  // protected fieldState = inject(FieldState);

  // protected basics = this.fieldState.basics;
  // protected config = this.fieldState.config;


  constructor(
    private editRoutingService: EditRoutingService,
    public formsStateService: FormsStateService,
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();

    this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid)
      .pipe(distinctUntilChanged())
      .subscribe(isOpen => {
        this.dialogIsOpen.set(isOpen);
        this.fieldsSettingsService.updateSetting(this.config.fieldName, { _isDialog: isOpen });
      });
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

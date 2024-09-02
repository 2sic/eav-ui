import { Component, inject, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { distinctUntilChanged } from 'rxjs';
import { ContentExpandAnimation } from '../expand-dialog/content-expand.animation';
import { TranslateModule } from '@ngx-translate/core';
import { MatRippleModule } from '@angular/material/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { FieldState } from '../../field-state';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { BaseComponent } from '../../../../shared/components/base.component';
import { FieldsSettingsService } from '../../../state/fields-settings.service';
import { FormsStateService } from '../../../state/forms-state.service';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';
import { WrappersCatalog } from '../wrappers.constants';

const logThis = false;
const nameOfThis = 'PickerExpandableWrapper';
@Component({
  selector: WrappersCatalog.PickerExpandableWrapper,
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
    MatIconModule,
    CdkScrollable,
    ...ExtendedFabSpeedDialImports,
    MatRippleModule,
    TranslateModule,
    TippyDirective,
  ],
})
export class PickerExpandableWrapperComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('previewComponent', { static: true, read: ViewContainerRef }) previewComponent: ViewContainerRef;

  dialogIsOpen = signal(false);

  private fieldState = inject(FieldState);
  protected basics = this.fieldState.basics;
  private config = this.fieldState.config;

  constructor(
    private editRoutingService: EditRoutingService,
    public formsStateService: FormsStateService,
    private fieldsSettingsService: FieldsSettingsService,
  ) {
    super();
  }

  ngOnInit() {
    this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid)
      .subscribe(isOpen => {
        this.dialogIsOpen.set(isOpen);
        this.fieldsSettingsService.updateSetting(this.config.fieldName, { _isDialog: isOpen }, nameOfThis);
      });
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  saveAll(close: boolean) {
    this.formsStateService.triggerSave(close);
  }
}

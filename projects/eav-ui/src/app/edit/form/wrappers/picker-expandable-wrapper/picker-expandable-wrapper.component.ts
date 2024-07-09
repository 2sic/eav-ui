import { Component, inject, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { distinctUntilChanged } from 'rxjs';
import { WrappersConstants } from '../../../shared/constants';
import { EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { ContentExpandAnimation } from '../expandable-wrapper/content-expand.animation';
import { TranslateModule } from '@ngx-translate/core';
import { MatRippleModule } from '@angular/material/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { FieldState } from '../../builder/fields-builder/field-state';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';

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

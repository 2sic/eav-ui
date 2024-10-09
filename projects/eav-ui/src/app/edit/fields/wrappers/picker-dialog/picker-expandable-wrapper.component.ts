import { CdkScrollable } from '@angular/cdk/scrolling';
import { CommonModule, NgClass } from '@angular/common';
import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { classLog } from '../../../../shared/logging';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { FormsStateService } from '../../../form/forms-state.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { FieldsSettingsService } from '../../../state/fields-settings.service';
import { FieldState } from '../../field-state';
import { DialogPopupComponent } from '../dialog-popup/dialog-popup.component';
import { ContentExpandAnimation } from '../expand-dialog/content-expand.animation';
import { WrappersCatalog } from '../wrappers.constants';

@Component({
  selector: WrappersCatalog.PickerExpandableWrapper,
  templateUrl: './picker-expandable-wrapper.component.html',
  styleUrls: ['./picker-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
  standalone: true,
  // TODO: @2pp - this still has imports which are not used anymore, since the dialog-popup is now a standalone component
  // Pls review and clean up.
  imports: [
    NgClass,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CdkScrollable,
    ...ExtendedFabSpeedDialImports,
    MatRippleModule,
    TranslateModule,
    TippyDirective,
    DialogPopupComponent,
    CommonModule,
  ],
})
export class PickerExpandableWrapperComponent {

  log = classLog({PickerExpandableWrapperComponent});

  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('previewComponent', { static: true, read: ViewContainerRef }) previewComponent: ViewContainerRef;

  protected fieldState = inject(FieldState);
  public config = this.fieldState.config;
  protected basics = this.fieldState.basics;
  
  constructor(
    private editRoutingService: EditRoutingService,
    public formsStateService: FormsStateService,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }
}

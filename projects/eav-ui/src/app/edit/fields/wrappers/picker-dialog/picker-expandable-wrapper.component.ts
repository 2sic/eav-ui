import { CommonModule } from "@angular/common";
import { Component, inject, ViewChild, ViewContainerRef } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { classLog } from '../../../../shared/logging';
import { FormsStateService } from "../../../form/forms-state.service";
import { FieldState } from "../../field-state";
import { DialogPopupComponent } from "../dialog-popup/dialog-popup.component";
import { ContentExpandAnimation } from "../expand-dialog/content-expand.animation";
import { WrappersCatalog } from "../wrappers.constants";


@Component({
  selector: WrappersCatalog.PickerExpandableWrapper,
  templateUrl: './picker-expandable-wrapper.component.html',
  styleUrls: ['./picker-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
  standalone: true,
  imports: [
    MatCardModule,
    DialogPopupComponent,
    DialogPopupComponent,
    CommonModule,
  ],
})
export class PickerExpandableWrapperComponent {

  log = classLog({ PickerExpandableWrapperComponent });

  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('previewComponent', { static: true, read: ViewContainerRef }) previewComponent: ViewContainerRef;

  protected fieldState = inject(FieldState);
  public config = this.fieldState.config;
  protected basics = this.fieldState.basics;

  constructor(
    public formsStateService: FormsStateService,
  ) { }
}

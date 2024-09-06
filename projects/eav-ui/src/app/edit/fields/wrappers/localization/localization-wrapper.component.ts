import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateMenuComponent } from '../../../fields/wrappers/localization/translate-menu/translate-menu.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { FieldState } from '../../field-state';
import { FormConfigService } from '../../../form/form-config.service';
import { FormsStateService } from '../../../form/forms-state.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { WrappersCatalog } from '../wrappers.constants';

@Component({
  selector: WrappersCatalog.LocalizationWrapper,
  templateUrl: './localization-wrapper.component.html',
  styleUrls: ['./localization-wrapper.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    ExtendedModule,
    TranslateMenuComponent,
  ],
})
export class LocalizationWrapperComponent {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(TranslateMenuComponent) private translateMenu: TranslateMenuComponent;

  protected formConfig = inject(FormConfigService);
  protected fieldState = inject(FieldState);

  protected config = this.fieldState.config;
  protected control = this.fieldState.control;


  language = this.formConfig.language;
  hideTranslateButton: boolean = true;

  constructor(
    private editRoutingService: EditRoutingService,
    private formsStateService: FormsStateService,
  ) { }

  translate() {
    if (this.formsStateService.readOnly().isReadOnly) return;
    const language = this.formConfig.language();
    if (language.current === language.primary) return;
    if (!this.control.disabled) return;
    const isExpanded = this.editRoutingService.isExpanded(this.config.index, this.config.entityGuid);
    if (isExpanded) return;

    this.translateMenu.translate();
  }

  toggleTranslateButtonVisibility(hide: boolean) {
    this.hideTranslateButton = hide;
  }
}

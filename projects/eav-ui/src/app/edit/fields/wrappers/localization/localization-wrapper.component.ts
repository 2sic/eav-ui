import { NgClass } from '@angular/common';
import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateMenuComponent } from '../../../fields/wrappers/localization/translate-menu/translate-menu.component';
import { FormConfigService } from '../../../form/form-config.service';
import { FormsStateService } from '../../../form/forms-state.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { FieldState } from '../../field-state';
import { WrappersCatalog } from '../wrappers.constants';

@Component({
  selector: WrappersCatalog.LocalizationWrapper,
  templateUrl: './localization-wrapper.component.html',
  styleUrls: ['./localization-wrapper.component.scss'],
  imports: [
    NgClass,
    TranslateMenuComponent,
  ]
})
export class LocalizationWrapperComponent {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(TranslateMenuComponent) private translateMenu: TranslateMenuComponent;

  #formConfig = inject(FormConfigService);
  #fieldState = inject(FieldState);

  language = this.#formConfig.language;
  hideTranslateButton: boolean = true;

  constructor(
    private editRoutingService: EditRoutingService,
    private formsStateService: FormsStateService,
  ) { }

  translate() {
    if (this.formsStateService.readOnly().isReadOnly) return;
    const language = this.#formConfig.language();
    if (language.current === language.primary) return;
    if (!this.#fieldState.ui().disabled) return;
    const config = this.#fieldState.config;
    const isExpanded = this.editRoutingService.isExpanded(config.index, config.entityGuid);
    if (isExpanded) return;

    this.translateMenu.translate();
  }

  toggleTranslateButtonVisibility(hide: boolean) {
    this.hideTranslateButton = hide;
  }
}

import { Component, Input, computed, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChangeAnchorTargetDirective } from '../directives/change-anchor-target.directive';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { FieldState } from '../field-state';
import { ValidationMessagesHelpers } from '../../shared/validation/validation-messages.helpers';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { SignalHelpers } from '../../../shared/helpers/signal.helpers';

@Component({
  selector: 'app-field-helper-text',
  templateUrl: './field-help-text.component.html',
  styleUrls: ['./field-help-text.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    ExtendedModule,
    MatFormFieldModule,
    FlexModule,
    ChangeAnchorTargetDirective,
    AsyncPipe,
    TranslateModule,
    SafeHtmlPipe,
  ],
})
export class FieldHelperTextComponent {
  @Input() disableError = false;
  @Input() hyperlinkDefaultWrapperFix = false;

  protected fieldState = inject(FieldState);

  invalidControl = computed(() => this.fieldState.control.invalid);
  disabledControl = computed(() => this.fieldState.control.disabled);

  protected settings = this.fieldState.settings;

  protected notes = computed(() => this.settings().Notes, SignalHelpers.stringEquals);

  isFullText = false;

  /** Don't toggle if clicked on an anchor tag or it's children */
  toggleHint(event: MouseEvent) {
    let target = event.target as HTMLElement;

    if (target.nodeName.toLocaleLowerCase() === 'a') return;
    while (target && target.classList && !target.classList.contains('notes-container')) {
      target = target.parentNode as HTMLElement;
      if (!target) return;
      if (target.nodeName.toLocaleLowerCase() === 'a') return;
    }

    this.isFullText = !this.isFullText;
  }

  getErrorMessage() {
    return ValidationMessagesHelpers.getErrorMessage(this.fieldState.control, this.fieldState.config);
  }

  getWarningMessage() {
    return ValidationMessagesHelpers.getWarningMessage(this.fieldState.control);
  }
}

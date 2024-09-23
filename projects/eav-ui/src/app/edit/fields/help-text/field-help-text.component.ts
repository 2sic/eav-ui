import { Component, Input, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChangeAnchorTargetDirective } from '../directives/change-anchor-target.directive';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { FieldState } from '../field-state';
import { ValidationMsgHelper } from '../../shared/validation/validation-messages.helpers';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { computedObj } from '../../../shared/signals/signal.utilities';

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

  /** Make the control "flat" to not take space if there is nothing to show. */
  flatIfEmpty = input(false);

  protected fieldState = inject(FieldState);

  constructor() { }

  protected settings = this.fieldState.settings;

  #invalid = computedObj('invalid', () => this.fieldState.ui().invalid);
  disabled = computedObj('disabled', () => this.fieldState.ui().disabled);

  showErrors = computedObj('showErrors', () => this.#invalid() && !this.disableError);

  notes = computedObj('notes', () => this.settings().Notes);

  isEmpty = computedObj('isEmpty', () => !this.notes() && !this.showErrors());

  errorMessage = computedObj('errorMessage', () => ValidationMsgHelper.getErrors(this.fieldState.ui(), this.fieldState.config));

  warningMessage = computedObj('warningMessage', () => ValidationMsgHelper.getWarnings(this.fieldState.ui()));

  /**
   * Show the control if:
   * - it's not empty (which already checks if it has errors) 
   * - and if it doesn't have warnings
   * - and flat wasn't preferred
   */
  show = computedObj('show', () => !this.isEmpty() || this.warningMessage() || !this.flatIfEmpty());

  showExpand = true;

  /** Don't toggle if clicked on an anchor tag or it's children */
  toggleHint(event: MouseEvent) {
    let target = event.target as HTMLElement;

    if (target.nodeName.toLocaleLowerCase() === 'a') return;
    while (target && target.classList && !target.classList.contains('notes-container')) {
      target = target.parentNode as HTMLElement;
      if (!target) return;
      if (target.nodeName.toLocaleLowerCase() === 'a') return;
    }

    this.showExpand = !this.showExpand;
  }
}

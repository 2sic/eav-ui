import { NgClass } from '@angular/common';
import { Component, Input, inject, input } from '@angular/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { computedObj } from '../../../shared/signals/signal.utilities';
import { ValidationMsgHelper } from '../../shared/validation/validation-messages.helpers';
import { ChangeAnchorTargetDirective } from '../directives/change-anchor-target.directive';
import { FieldState } from '../field-state';

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

  constructor() {
    // Get the component ID from the compiler, so we can use it in the template
    // This is to get style encapsulation to work with inner html
    this.componentId = (this.constructor as unknown as { ['ɵcmp']: { id: string } })['ɵcmp'].id;
  }

  componentId: string;

  protected settings = this.fieldState.settings;

  #invalid = computedObj('invalid', () => this.fieldState.ui().invalid);
  disabled = computedObj('disabled', () => this.fieldState.ui().disabled);

  showErrors = computedObj('showErrors', () => this.#invalid() && !this.disableError);

  notes = computedObj('notes', () => {
    const n = this.settings().Notes ?? '';
    return n.replace(/<p>/g, `<p _ngcontent-ng-${this.componentId}>`);
  });

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
    while (target && target.classList && !target.classList.contains('id-notes-container')) {
      target = target.parentNode as HTMLElement;
      if (!target) return;
      if (target.nodeName.toLocaleLowerCase() === 'a') return;
    }

    this.showExpand = !this.showExpand;
  }


}

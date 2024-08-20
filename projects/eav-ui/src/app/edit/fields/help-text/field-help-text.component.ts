import { Component, Input, OnInit, computed, inject } from '@angular/core';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { FieldHelperTextViewModel } from './field-help-text.models';
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
import { mapUntilChanged } from '../../../shared/rxJs/mapUntilChanged';

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
export class FieldHelperTextComponent implements OnInit {
  @Input() disableError = false;
  @Input() hyperlinkDefaultWrapperFix = false;

  protected fieldState = inject(FieldState);

  protected settings = this.fieldState.settings;

  protected notes = computed(() => this.settings().Notes, SignalHelpers.stringEquals);

  isFullText = false;
  viewModel$: Observable<FieldHelperTextViewModel>;

  constructor() { }

  ngOnInit() {
    const control = this.fieldState.control;

    const invalid$ = control.valueChanges.pipe(
      map(() => control.invalid),
      startWith(control.invalid),
      mapUntilChanged(m => m),
    );
    const disabled$ = control.valueChanges.pipe(
      map(() => control.disabled),
      startWith(control.disabled),
      mapUntilChanged(m => m),
    );

    this.viewModel$ = combineLatest([invalid$, disabled$]).pipe(
      map(([invalid, disabled]) => {
        const viewModel: FieldHelperTextViewModel = {
          invalid,
          disabled,
        };
        return viewModel;
      }),
    );
  }

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

import { Component, Input, OnInit, computed, inject } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable, startWith } from 'rxjs';
import { ValidationMessagesHelpers } from '../../../shared/helpers';
import { FieldState } from '../../builder/fields-builder/field-state';
import { FieldHelperTextViewModel } from './field-helper-text.models';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';
import { ChangeAnchorTargetDirective } from '../../../shared/directives/change-anchor-target.directive';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';

@Component({
  selector: 'app-field-helper-text',
  templateUrl: './field-helper-text.component.html',
  styleUrls: ['./field-helper-text.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    ExtendedModule,
    MatFormFieldModule,
    FlexModule,
    ChangeAnchorTargetDirective,
    SharedComponentsModule,
    AsyncPipe,
    TranslateModule,
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
      distinctUntilChanged(),
    );
    const disabled$ = control.valueChanges.pipe(
      map(() => control.disabled),
      startWith(control.disabled),
      distinctUntilChanged(),
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

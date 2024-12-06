// tslint:disable-next-line:max-line-length
import { NgTemplateOutlet } from '@angular/common';
import { AfterContentInit, Component, ContentChild, ContentChildren, ElementRef, input, OnDestroy, QueryList, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, startWith } from 'rxjs';
import { BaseComponent } from '../../components/base.component';
import { ExtendedFabSpeedDialActionDirective } from './extended-fab-speed-dial-action.directive';
import { ExtendedFabSpeedDialActionsContentDirective } from './extended-fab-speed-dial-actions-content.directive';
import { ExtendedFabSpeedDialTriggerContentDirective } from './extended-fab-speed-dial-trigger-content.directive';

/**
 * Special Speed-Dial kind of FAB which opens more menu items on hover.
 *
 * IMPORTANT: to work it needs ca. 4 more directives.
 * So never import this component directly, but instead import the ExtendedFabSpeedDialImports.
 */
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'extended-fab-speed-dial',
    templateUrl: './extended-fab-speed-dial.component.html',
    styleUrls: ['./extended-fab-speed-dial.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet
    ]
})
export class ExtendedFabSpeedDialComponent extends BaseComponent implements AfterContentInit, OnDestroy {
  @ContentChild(ExtendedFabSpeedDialTriggerContentDirective) trigger: ExtendedFabSpeedDialTriggerContentDirective;
  @ContentChild(ExtendedFabSpeedDialActionsContentDirective) actions: ExtendedFabSpeedDialActionsContentDirective;
  @ContentChildren(ExtendedFabSpeedDialActionDirective, { read: ElementRef }) actionButtons: QueryList<ElementRef<HTMLButtonElement>>;

  disabled = input<boolean>(false);

  open$ = new BehaviorSubject(false);

  constructor() {
    super();
  }

  ngAfterContentInit(): void {
    this.subscriptions.add(
      combineLatest([
        this.open$.pipe(distinctUntilChanged()),
        this.actionButtons.changes.pipe(startWith(undefined)),
      ]).subscribe(([open]) => {
        this.actionButtons.forEach((btn, i, all) => {
          const min = 0.3;
          const max = Math.min(min + (all.length - 1) * 0.05, 0.6);
          const step = (max - min) / (all.length - 1);
          const transitionDuration = `${open ? min + step * i : max - step * i}s`;
          if (btn.nativeElement.style.transitionDuration !== transitionDuration) {
            btn.nativeElement.style.transitionDuration = transitionDuration;
          }
        });
      }),
    );
  }

  ngOnDestroy(): void {
    this.open$.complete();
    super.ngOnDestroy();
  }

  setOpen(event: PointerEvent, open: boolean): void {
    if (event.pointerType === 'touch') return;
    this.open$.next(open);
  }
}

import { ChangeDetectorRef, Directive, ViewContainerRef, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { computedObj } from '../../shared/signals/signal.utilities';
import { FeatureInfoDialogComponent } from '../feature-info-dialog/feature-info-dialog.component';
import { FeaturesService } from '../features.service';

/**
 * Base component for various UI components which inform that a feature is not enabled.
 * It's meant to show the indicator/warning, and open a dialog with more information about the feature.
 */
@Directive()
export class FeatureComponentBase {

  /** Feature NameId to check */
  featureNameId = input.required<string>();

  /** When to show it - typically when it is _not_ enabled (default) */
  showIf = input<boolean>(false);

  #matDialog = inject(MatDialog);
  #viewContainerRef = inject(ViewContainerRef);
  #changeDetectorRef = inject(ChangeDetectorRef);
  #featuresService = inject(FeaturesService);

  constructor() { }

  feature = computedObj('feature', () => this.#featuresService.getCurrent(this.featureNameId()));

  show = computedObj('show', () => {
    const feat = this.feature();
    if (feat == null) return false;
    return this.showIf() == (feat?.isEnabled ?? false);
  })

  openDialog() {
    openFeatureDialog(this.#matDialog, this.featureNameId(), this.#viewContainerRef, this.#changeDetectorRef);
  }
}

export function openFeatureDialog(dialog: MatDialog, featureId: string, viewContainerRef: ViewContainerRef, changeDetectorRef: ChangeDetectorRef) {
  dialog.open(FeatureInfoDialogComponent, {
    autoFocus: false,
    data: featureId,
    viewContainerRef: viewContainerRef,
    width: '400px',
  });

  changeDetectorRef?.markForCheck();
}

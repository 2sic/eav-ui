import { ChangeDetectorRef, Directive, Input, ViewContainerRef, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesScopedService } from '../features-scoped.service';
import { FeatureInfoDialogComponent } from '../feature-info-dialog/feature-info-dialog.component';
import { BehaviorSubject, switchMap, Observable, map, combineLatest } from 'rxjs';
import { FeatureSummary } from '../models';

@Directive()
export class FeatureComponentBase {
  // TODO: @2dg - convert this to signal using 'input(...)'
  /** Feature NameId to check */
  @Input()
  public set featureNameId(value: string) { this.featureNameId$.next(value); }
  protected featureNameId$ = new BehaviorSubject<string>(null);

  // TODO: @2dg - convert this to signal using 'input(...)'
  /** By default, it will show if it's false - here we can change it to show if true */
  @Input()
  public set showIf(value: boolean) { this.showIf$.next(value == true); }
  protected showIf$ = new BehaviorSubject<boolean>(false);

  #dialog = inject(MatDialog);
  #viewContainerRef = inject(ViewContainerRef);
  #changeDetectorRef = inject(ChangeDetectorRef);
  #featuresService = inject(FeaturesScopedService);

  constructor() {
    this.feature$ = this.featureNameId$.pipe(
      switchMap(featName => this.#featuresService.get$(featName))
    );
    this.show$ = combineLatest([this.feature$, this.showIf$]).pipe(
      map(([feat, showIf]) => showIf == (feat?.isEnabled ?? false))
    );
  }

  // TODO: @2dg - convert this to signal
  // Note that this is a base class, so the change will affect a few components
  feature$: Observable<FeatureSummary>;
  show$: Observable<boolean>;

  openDialog() {
    openFeatureDialog(this.#dialog, this.featureNameId$.value, this.#viewContainerRef, this.#changeDetectorRef);
  }
}


export function openFeatureDialog(dialog: MatDialog, featureId: string, viewContainerRef: ViewContainerRef, changeDetectorRef: ChangeDetectorRef) {
  dialog.open(FeatureInfoDialogComponent, {
    autoFocus: false,
    data: featureId,
    viewContainerRef: viewContainerRef,
    width: '400px',
  });

  changeDetectorRef.markForCheck();
}

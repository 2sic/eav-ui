import { ChangeDetectorRef, Directive, Input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureInfoDialogComponent } from '../feature-info-dialog/feature-info-dialog.component';
import { BehaviorSubject, switchMap, Observable, map, combineLatest } from 'rxjs';
import { FeatureSummary } from '../models';

@Directive()
export class FeatureComponentBase {
  /** Feature NameId to check */
  @Input()
  public set featureNameId(value: string) { this.featureNameId$.next(value); }
  protected featureNameId$ = new BehaviorSubject<string>(null);

  /** By default, it will show if it's false - here we can change it to show if true */
  @Input()
  public set showIf(value: boolean) { this.showIf$.next(value == true); }
  protected showIf$ = new BehaviorSubject<boolean>(false);

  // TODO: @SDV - MAKE REACTIVE - SEE text-info-component example
  // featureOn: boolean = true;
  feature$: Observable<FeatureSummary>;
  show$: Observable<boolean>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
    protected featuresService: FeaturesService
  ) {
    this.feature$ = this.featureNameId$.pipe(
      switchMap(featName => this.featuresService.get$(featName)
    ));
    this.show$ = combineLatest([this.feature$, this.showIf$]).pipe(
      // tap(data => console.log('2dm - show$', data)),
      map(([feat,showIf]) => showIf == (feat?.Enabled ?? false))
    );
  }

  openDialog() {
    FeatureComponentBase.openDialog(this.dialog, this.featureNameId$.value, this.viewContainerRef, this.changeDetectorRef);
  }

  /** Public/Static so it can be called from elsewhere */
  public static openDialog(dialog: MatDialog, featureId: string, viewContainerRef: ViewContainerRef, changeDetectorRef: ChangeDetectorRef) {
    dialog.open(FeatureInfoDialogComponent, {
      autoFocus: false,
      data: featureId,
      viewContainerRef: viewContainerRef,
      width: '400px',
    });

    changeDetectorRef.markForCheck();
  }
}

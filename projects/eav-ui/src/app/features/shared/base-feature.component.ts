import { ChangeDetectorRef, Directive, Input, ViewContainerRef, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureInfoDialogComponent } from '../feature-info-dialog/feature-info-dialog.component';
import { BehaviorSubject, switchMap, Observable, map, combineLatest } from 'rxjs';
import { FeatureSummary } from '../models';
import { FeatureDetailService } from '../services/feature-detail.service';

export const FeatureComponentProviders = [
  FeatureDetailService,
];

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

  private dialog = inject(MatDialog);
  private viewContainerRef = inject(ViewContainerRef);
  private changeDetectorRef = inject(ChangeDetectorRef);
  protected featuresService = inject(FeaturesService);

  constructor() {
    this.feature$ = this.featureNameId$.pipe(
      switchMap(featName => this.featuresService.get$(featName)
    ));
    this.show$ = combineLatest([this.feature$, this.showIf$]).pipe(
      // tap(data => console.log('2dm - show$', data)),
      map(([feat,showIf]) => showIf == (feat?.IsEnabled ?? false))
    );
  }

  openDialog() {
    openFeatureDialog(this.dialog, this.featureNameId$.value, this.viewContainerRef, this.changeDetectorRef);
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
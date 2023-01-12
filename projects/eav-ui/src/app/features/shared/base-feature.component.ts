import { Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureInfoDialogComponent } from '../feature-info-dialog/feature-info-dialog.component';
import { BehaviorSubject, switchMap, Observable, map, tap, combineLatest } from 'rxjs';
import { FeatureSummary } from '../models';

// TODO: rename to FeatureComponentBase (naming)
@Directive()
export class BaseFeatureComponent /* implements OnInit */ {
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

  // ngOnInit(): void {
  //   this.featureOn = this.featuresService.isEnabled(this.featureNameId);
  // }

  openDialog() {
    this.dialog.open(FeatureInfoDialogComponent, {
      autoFocus: false,
      data: this.featureNameId$.value,
      viewContainerRef: this.viewContainerRef,
      // TODO: this looks wrong. I believe we have some way to standardize dialog sizes...
      width: '600px',
    });
  }
}

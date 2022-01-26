import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../../edit/shared/helpers';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { FeaturesListNameComponent } from '../ag-grid-components/features-list-name/features-list-name.component';
import { Feature } from '../models/feature.model';
import { FeaturesConfigService } from '../services/features-config.service';
import { FeaturesStatusComponent } from './features-status/features-status.component';
import { FeaturesStatusParams } from './features-status/features-status.models';
import { FeatureState } from './manage-features-wip.models';

@Component({
  selector: 'app-manage-features-wip',
  templateUrl: './manage-features-wip.component.html',
  styleUrls: ['./manage-features-wip.component.scss'],
})
export class ManageFeaturesWipComponent implements OnInit, OnDestroy {
  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      booleanFilterComponent: BooleanFilterComponent,
      idFieldComponent: IdFieldComponent,
      featuresListNameComponent: FeaturesListNameComponent,
      featuresStatusComponent: FeaturesStatusComponent,
    },
    columnDefs: [
      {
        field: 'ID', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter',
        valueGetter: (params) => (params.data as Feature).Guid,
        cellRendererParams: {
          tooltipGetter: (feature: Feature) => `NameId: ${feature.NameId}\nGUID: ${feature.Guid}`,
        } as IdFieldParams,
      },
      {
        field: 'Name', flex: 3, minWidth: 250, cellClass: 'primary-action highlight', sortable: true,
        filter: 'agTextColumnFilter', cellRenderer: 'featuresListNameComponent',
        onCellClicked: (params) => this.openFeature(params.data),
        valueGetter: (params) => (params.data as Feature).Name,
      },
      {
        field: 'License', flex: 1, minWidth: 150, cellClass: 'no-outline', sortable: true, filter: 'agTextColumnFilter',
        valueGetter: (params) => (params.data as Feature).License,
      },
      {
        field: 'Status', width: 72, headerClass: 'dense', cellClass: 'no-padding no-outline',
        cellRenderer: 'featuresStatusComponent', sortable: true, filter: 'booleanFilterComponent',
        valueGetter: (params) => (params.data as Feature).Enabled,
        cellRendererParams: {
          onEnabledToggle: (feature, enabled) => this.toggle(feature, enabled),
        } as FeaturesStatusParams,
      },
    ],
  };

  features$ = new BehaviorSubject<Feature[]>(undefined);
  changed$: Observable<boolean>;
  private originalFeatures$ = new BehaviorSubject<Feature[]>(undefined);

  constructor(
    private dialogRef: MatDialogRef<ManageFeaturesWipComponent>,
    private featuresConfigService: FeaturesConfigService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.fetchFeatures();
    this.changed$ = combineLatest([this.features$, this.originalFeatures$]).pipe(
      map(([changedFeatures, originalFeatures]) => {
        if (changedFeatures == null || originalFeatures == null) { return false; }
        const changed = changedFeatures.some(f => !GeneralHelpers.objectsEqual(f, originalFeatures.find(o => o.Guid === f.Guid)));
        return changed;
      }),
    );
  }

  ngOnDestroy() {
    this.features$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  save() {
    this.snackBar.open('Saving...');
    const featuresStates = this.features$.value.map(feature => {
      const state: FeatureState = { FeatureGuid: feature.Guid, Enabled: feature.Enabled };
      return state;
    });
    this.featuresConfigService.saveFeaturesNew(featuresStates).subscribe({
      error: () => {
        this.snackBar.open('Failed to save features. Please check console for more information', undefined, { duration: 3000 });
      },
      next: () => {
        this.snackBar.open('Saved', undefined, { duration: 3000 });
        this.closeDialog();
      }
    });
  }

  private openFeature(feature: Feature) {
    window.open(`https://2sxc.org/r/f/${feature.Guid}`, '_blank');
  }

  private fetchFeatures() {
    this.featuresConfigService.getAll().subscribe(features => {
      this.originalFeatures$.next(features);
      this.features$.next(features);
    });
  }

  private toggle(feature: Feature, enabled: boolean) {
    const newFeatures = [...this.features$.value];
    const updateIndex = newFeatures.findIndex(f => f.Guid === feature.Guid);
    if (updateIndex < 0) { return; }
    newFeatures[updateIndex] = {
      ...newFeatures[updateIndex],
      Enabled: enabled,
    };
    this.features$.next(newFeatures);
  }
}

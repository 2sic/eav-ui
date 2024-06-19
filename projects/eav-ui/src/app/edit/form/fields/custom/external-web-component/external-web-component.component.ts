import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { consoleLogEditForm } from '../../../../../shared/helpers/console-log-angular.helper';
import { EditRoutingService, ScriptsLoaderService } from '../../../../shared/services';
import { BaseFieldComponent } from '../../base/base-field.component';
import { CustomGpsLogic } from './custom-gps-logic';
import { ExternalWebComponentViewModel } from './external-web-component.models';
import { StringWysiwygLogic } from './string-wysiwyg-logic';
import { AsyncPipe } from '@angular/common';
import { ConnectorComponent } from '../../../shared/connector/connector.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FieldState } from '../../../builder/fields-builder/field-state';

@Component({
  selector: InputTypeConstants.ExternalWebComponent,
  templateUrl: './external-web-component.component.html',
  styleUrls: ['./external-web-component.component.scss'],
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    ConnectorComponent,
    AsyncPipe,
  ],
})
export class ExternalWebComponentComponent  {
  viewModel: Observable<ExternalWebComponentViewModel>;

  protected fieldState = inject(FieldState);

  protected config = this.fieldState.config;
  protected group = this.fieldState.group;

  private loading$: BehaviorSubject<boolean>;

  constructor(
    private scriptsLoaderService: ScriptsLoaderService,
    private editRoutingService: EditRoutingService,
  ) {
    StringWysiwygLogic.importMe();
    CustomGpsLogic.importMe();
  }

  ngOnInit() {
    this.loading$ = new BehaviorSubject(true);
    const isExpanded$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    this.viewModel = combineLatest([
      combineLatest([this.loading$, isExpanded$]),
    ]).pipe(
      map(([
        [loading, isExpanded],
      ]) => {
        const viewModel: ExternalWebComponentViewModel = {
          loading,
          isExpanded,
        };
        return viewModel;
      }),
    );
    this.loadAssets();
  }

  ngOnDestroy() {
    this.loading$.complete();
  }

  private loadAssets() {
    const assets = this.config.angularAssets.split('\n');
    if (assets.length === 0) { return; }
    this.scriptsLoaderService.load(assets, this.assetsLoaded.bind(this));
  }

  private assetsLoaded() {
    consoleLogEditForm('ExternalWebcomponentComponent', this.config.fieldName, 'loaded');
    this.loading$.next(false);
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { consoleLogEditForm } from '../../../../../shared/helpers/console-log-angular.helper';
import { EditRoutingService, FieldsSettingsService, ScriptsLoaderService } from '../../../../shared/services';
import { BaseFieldComponent } from '../../base/base-field.component';
import { CustomGpsLogic } from './custom-gps-logic';
import { ExternalWebComponentViewModel } from './external-web-component.models';
import { StringWysiwygLogic } from './string-wysiwyg-logic';
import { AsyncPipe } from '@angular/common';
import { ConnectorComponent } from '../../../shared/connector/connector.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
export class ExternalWebComponentComponent extends BaseFieldComponent<string> implements OnInit, OnDestroy {
  viewModel: Observable<ExternalWebComponentViewModel>;

  private loading$: BehaviorSubject<boolean>;

  constructor(
    fieldsSettingsService: FieldsSettingsService,
    private scriptsLoaderService: ScriptsLoaderService,
    private editRoutingService: EditRoutingService,
  ) {
    super(fieldsSettingsService);
    StringWysiwygLogic.importMe();
    CustomGpsLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.loading$ = new BehaviorSubject(true);
    const isExpanded$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    this.viewModel = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.loading$, isExpanded$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [loading, isExpanded],
      ]) => {
        const viewModel: ExternalWebComponentViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
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
    super.ngOnDestroy();
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

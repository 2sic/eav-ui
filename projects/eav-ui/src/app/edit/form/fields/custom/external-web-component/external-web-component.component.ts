import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { consoleLogAngular } from '../../../../../shared/helpers/console-log-angular.helper';
import { EavService, EditRoutingService, FieldsSettingsService, ScriptsLoaderService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { CustomGpsLogic } from './custom-gps-logic';
import { ExternalWebComponentTemplateVars } from './external-web-component.models';
import { StringWysiwygLogic } from './string-wysiwyg-logic';

@Component({
  selector: InputTypeConstants.ExternalWebComponent,
  templateUrl: './external-web-component.component.html',
  styleUrls: ['./external-web-component.component.scss'],
})
@FieldMetadata({})
export class ExternalWebComponentComponent extends BaseFieldComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<ExternalWebComponentTemplateVars>;

  private loading$: BehaviorSubject<boolean>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private scriptsLoaderService: ScriptsLoaderService,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, fieldsSettingsService);
    StringWysiwygLogic.importMe();
    CustomGpsLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.loading$ = new BehaviorSubject(true);
    const isExpanded$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.loading$, isExpanded$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [loading, isExpanded],
      ]) => {
        const templateVars: ExternalWebComponentTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          loading,
          isExpanded,
        };
        return templateVars;
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
    consoleLogAngular('ExternalWebcomponentComponent', this.config.fieldName, 'loaded');
    this.loading$.next(false);
  }
}

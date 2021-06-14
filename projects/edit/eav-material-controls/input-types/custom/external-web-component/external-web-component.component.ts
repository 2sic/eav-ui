import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { consoleLogAngular } from '../../../../../ng-dialogs/src/app/shared/helpers/console-log-angular.helper';
import { ComponentMetadata } from '../../../../form/builder/eav-field/component-metadata.decorator';
import { EavService, EditRoutingService, FieldsSettingsService, ScriptsLoaderService } from '../../../../shared/services';
import { BaseComponent } from '../../base/base.component';
import { ExternalWebComponentTemplateVars } from './external-web-component.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'external-web-component',
  templateUrl: './external-web-component.component.html',
  styleUrls: ['./external-web-component.component.scss'],
})
@ComponentMetadata({})
export class ExternalWebComponentComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<ExternalWebComponentTemplateVars>;

  private loading$: BehaviorSubject<boolean>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private scriptsLoaderService: ScriptsLoaderService,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, fieldsSettingsService);
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

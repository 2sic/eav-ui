import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { angularConsoleLog } from '../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { EavService, EditRoutingService, FieldsSettingsService, ScriptsLoaderService } from '../../../../shared/services';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
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
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    private scriptsLoaderService: ScriptsLoaderService,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.loading$ = new BehaviorSubject(true);
    const isExpanded$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    this.templateVars$ = combineLatest([this.loading$, isExpanded$, this.disabled$, this.showValidation$]).pipe(
      map(([loading, isExpanded, disabled, showValidation]) => {
        const templateVars: ExternalWebComponentTemplateVars = {
          loading,
          isExpanded,
          disabled,
          showValidation,
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
    angularConsoleLog('ExternalWebcomponentComponent', this.config.fieldName, 'loaded');
    this.loading$.next(false);
  }
}

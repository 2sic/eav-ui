import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { InputType } from '../../../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { angularConsoleLog } from '../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { EavService } from '../../../../shared/services/eav.service';
import { EditRoutingService } from '../../../../shared/services/edit-routing.service';
import { FieldsSettings2NewService } from '../../../../shared/services/fields-settings2new.service';
import { ScriptsLoaderService } from '../../../../shared/services/scripts-loader.service';
import { InputTypeService } from '../../../../shared/store/ngrx-data/input-type.service';
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
    fieldsSettings2NewService: FieldsSettings2NewService,
    private inputTypeService: InputTypeService,
    private scriptsLoaderService: ScriptsLoaderService,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, validationMessagesService, fieldsSettings2NewService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.loading$ = new BehaviorSubject(true);
    const isExpanded$ = this.editRoutingService.isExpanded(this.config.field.index, this.config.entity.entityGuid);

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
    let inputType: InputType;
    this.inputTypeService.getInputTypeById(this.config.field.inputType).pipe(take(1)).subscribe(type => {
      inputType = type;
    });

    const assets = inputType.AngularAssets.split('\n');
    if (assets.length === 0) { return; }
    this.scriptsLoaderService.load(assets, this.assetsLoaded.bind(this));
  }

  private assetsLoaded() {
    angularConsoleLog('ExternalWebcomponentComponent', this.config.field.name, 'loaded');
    this.loading$.next(false);
  }
}

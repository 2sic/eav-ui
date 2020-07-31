import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { take, map } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { InputType as InputTypeModel } from '../../../../shared/models/eav';
import { InputTypeService } from '../../../../shared/store/ngrx-data/input-type.service';
import { ScriptsLoaderService } from '../../../../shared/services/scripts-loader.service';
import { ExpandableFieldService } from '../../../../shared/services/expandable-field.service';
import { angularConsoleLog } from '../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { BaseComponent } from '../../base/base.component';
import { EavService } from '../../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'external-web-component',
  templateUrl: './external-web-component.component.html',
  styleUrls: ['./external-web-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({})
export class ExternalWebComponentComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  loading$ = new BehaviorSubject(true);
  isExpanded$: Observable<boolean>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private inputTypeService: InputTypeService,
    private scriptsLoaderService: ScriptsLoaderService,
    private expandableFieldService: ExpandableFieldService,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.isExpanded$ = this.expandableFieldService
      .getObservable()
      .pipe(map(expandedFieldId => this.config.field.index === expandedFieldId));
    this.loadAssets();
  }

  ngOnDestroy() {
    this.loading$.complete();
    super.ngOnDestroy();
  }

  private loadAssets() {
    let inputType: InputTypeModel;
    this.inputTypeService.getInputTypeById(this.config.field.inputType).pipe(take(1)).subscribe(type => { inputType = type; });

    const assets = inputType.AngularAssets.split('\n');
    if (assets.length === 0) { return; }
    this.scriptsLoaderService.load(assets, this.assetsLoaded.bind(this));
  }

  private assetsLoaded() {
    angularConsoleLog('ExternalWebcomponentComponent', this.config.field.name, 'loaded');
    this.loading$.next(false);
  }
}

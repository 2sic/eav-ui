import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { InputType as InputTypeModel } from '../../../../shared/models/eav';
import { InputTypeService } from '../../../../shared/store/ngrx-data/input-type.service';
import { ScriptsLoaderService } from '../../../../shared/services/scripts-loader.service';
import { ExpandableFieldService } from '../../../../shared/services/expandable-field.service';
import { angularConsoleLog } from '../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'external-web-component',
  templateUrl: './external-web-component.component.html',
  styleUrls: ['./external-web-component.component.scss']
})
@InputType({})
export class ExternalWebComponentComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  loadingSpinner = true;
  shouldShowConnector = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private inputTypeService: InputTypeService,
    private scriptsLoaderService: ScriptsLoaderService,
    private expandableFieldService: ExpandableFieldService,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.expandableFieldService.getObservable().subscribe(expandedFieldId => {
        const dialogShouldBeOpen = (this.config.field.index === expandedFieldId);
        if (dialogShouldBeOpen === this.shouldShowConnector) { return; }
        this.shouldShowConnector = dialogShouldBeOpen;
      }),
    );
    this.loadAssets();
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
    this.loadingSpinner = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }
}

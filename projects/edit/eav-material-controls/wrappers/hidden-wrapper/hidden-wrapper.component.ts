import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavService } from '../../../shared/services/eav.service';
import { FormulaInstanceService } from '../../../shared/services/formula-instance.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-hidden-wrapper',
  templateUrl: './hidden-wrapper.component.html',
  styleUrls: ['./hidden-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HiddenWrapperComponent extends BaseComponent<any> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  hidden$: Observable<boolean>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private formulaInstance: FormulaInstanceService,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();

    const settingsVisible$ = this.settings$.pipe(map(settings => settings.VisibleInEditUI != null ? settings.VisibleInEditUI : true));
    const formulaHidden$ = this.formulaInstance.getFormulaHidden(this.config.field.name);
    this.hidden$ = combineLatest([settingsVisible$, formulaHidden$]).pipe(
      map(([settingsVisible, formulaHidden]) => !settingsVisible || formulaHidden),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}

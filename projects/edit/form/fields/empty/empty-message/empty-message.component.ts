import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../shared/services';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { EmptyMessageTemplateVars } from './empty-message.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'empty-message',
  templateUrl: './empty-message.component.html',
  styleUrls: ['./empty-message.component.scss'],
})
@FieldMetadata({})
export class EmptyMessageComponent implements OnInit {
  @Input() config: FieldConfigSet;

  templateVars$: Observable<EmptyMessageTemplateVars>;

  constructor(private fieldsSettingsService: FieldsSettingsService) { }

  ngOnInit() {
    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        Notes: settings.Notes,
        Visible: settings.Visible,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
    this.templateVars$ = combineLatest([settings$]).pipe(
      map(([settings]) => {
        const templateVars: EmptyMessageTemplateVars = {
          notes: settings.Notes,
          visible: settings.Visible,
        };
        return templateVars;
      }),
    );
  }
}

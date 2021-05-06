import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, share, startWith } from 'rxjs/operators';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldsSettingsService } from '../../../shared/services';
import { EmptyDefaultLogic } from './collapsible-wrapper-logic';

@Component({
  selector: 'app-collapsible-wrapper',
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsibleWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  visibleInEditUI$: Observable<boolean>;
  collapse: boolean;
  label$: Observable<string>;
  notes$: Observable<string>;

  constructor(private fieldsSettingsService: FieldsSettingsService) {
    EmptyDefaultLogic.importMe();
  }

  ngOnInit() {
    const settingsSnapshot = this.fieldsSettingsService.getFieldSettings(this.config.fieldName);
    this.collapse = settingsSnapshot.DefaultCollapsed;

    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(share(), startWith(settingsSnapshot));
    this.visibleInEditUI$ = settings$.pipe(map(settings => settings.VisibleInEditUI), distinctUntilChanged());
    this.label$ = settings$.pipe(map(settings => settings.Name), distinctUntilChanged());
    this.notes$ = settings$.pipe(map(settings => settings.Notes), distinctUntilChanged());
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}

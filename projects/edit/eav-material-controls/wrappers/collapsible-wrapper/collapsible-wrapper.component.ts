import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldsSettings2NewService } from '../../../shared/services/fields-settings2new.service';
import { EmptyDefaultLogic } from './collapsible-wrapper-logic';

@Component({
  selector: 'app-collapsible-wrapper',
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsibleWrapperComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  visibleInEditUI$: Observable<boolean>;
  collapse: boolean;
  label$: Observable<string>;
  notes$: Observable<string>;

  private settings$ = new BehaviorSubject<FieldSettings>(null);
  private subscription = new Subscription();

  constructor(private fieldsSettings2NewService: FieldsSettings2NewService) {
    EmptyDefaultLogic.importMe();
  }

  ngOnInit() {
    const settings$ = this.fieldsSettings2NewService.getFieldSettings$(this.config.field.name);
    this.subscription.add(
      settings$.subscribe(settings => {
        this.settings$.next(settings);
      })
    );
    this.collapse = this.settings$.value.DefaultCollapsed;

    this.visibleInEditUI$ = this.settings$.pipe(map(settings => settings.VisibleInEditUI));
    this.label$ = this.settings$.pipe(map(settings => settings.Name));
    this.notes$ = this.settings$.pipe(map(settings => settings.Notes));
  }

  ngOnDestroy() {
    this.settings$.complete();
    this.subscription.unsubscribe();
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}

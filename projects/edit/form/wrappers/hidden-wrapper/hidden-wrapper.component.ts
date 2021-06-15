import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { EavService, FieldsSettingsService } from '../../../shared/services';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseComponent } from '../../fields/base/base.component';

@Component({
  selector: 'app-hidden-wrapper',
  templateUrl: './hidden-wrapper.component.html',
  styleUrls: ['./hidden-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HiddenWrapperComponent extends BaseComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  hidden$: Observable<boolean>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.hidden$ = this.settings$.pipe(map(settings => !settings.Visible), distinctUntilChanged());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}

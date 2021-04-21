import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentsModule } from '../../ng-dialogs/src/app/shared/shared-components.module';
import { EavMaterialControlsModule } from '../eav-material-controls/eav-material-controls.module';
import { ContentTypeWrapperComponent } from './components/content-type-wrapper/content-type-wrapper.component';
import { EavFieldDirective } from './components/eav-field/eav-field.directive';
import { EavFormComponent } from './components/eav-form/eav-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatCardModule,
    MatIconModule,
    EavMaterialControlsModule,
    MatSlideToggleModule,
    TranslateModule,
    MatTooltipModule,
    SharedComponentsModule,
    FlexLayoutModule,
  ],
  declarations: [
    EavFieldDirective,
    EavFormComponent,
    ContentTypeWrapperComponent,
  ],
  exports: [
    EavFormComponent,
  ],
  providers: [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ],
})
export class EavDynamicFormModule { }

import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { appNameError, appNamePattern } from '../constants/app.patterns';
import { AppsListService } from '../services/apps-list.service';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterOutlet } from '@angular/router';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';

@Component({
    selector: 'app-create-app',
    templateUrl: './create-app.component.html',
    styleUrls: ['./create-app.component.scss'],
    standalone: true,
    imports: [
        RouterOutlet,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        SharedComponentsModule,
        MatSelectModule,
        MatOptionModule,
        MatDialogActions,
        MatButtonModule,
        AsyncPipe,
        FieldHintComponent,
    ],
    providers: [
        AppsListService,
    ]
})
export class CreateAppComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;
  loading$: BehaviorSubject<boolean>;
  appNameError = appNameError;
  appTemplateId = '1';

  viewModel$: Observable<CreateAppViewModel>;

  constructor(
    private dialogRef: MatDialogRef<CreateAppComponent>,
    private appsListService: AppsListService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.buildForm();
    this.loading$ = new BehaviorSubject(false);
  }

  ngOnInit(): void {
    this.viewModel$ = this.loading$.pipe(
      map((loading) => ({ loading })),
    );
  }

  ngOnDestroy(): void {
    this.loading$.complete();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  create(): void {
    this.form.disable();
    this.loading$.next(true);
    const name = this.form.controls.name.value?.trim().replace(/\s\s+/g, ' '); // remove multiple white spaces and tabs;
    const appTemplateId = Number(this.appTemplateId);
    // console.warn('2dm: name', name, this.appTemplateId);
    // return;

    this.snackBar.open('Creating app...');
    this.appsListService.create(name, null, appTemplateId).subscribe({
      error: () => {
        this.form.enable();
        this.loading$.next(false);
        this.snackBar.open('Failed to create app. Please check console for more information', undefined, { duration: 3000 });
      },
      next: () => {
        this.form.enable();
        this.snackBar.open('Created app', undefined, { duration: 2000 });
        this.closeDialog();
      },
    });
  }

  private buildForm(): UntypedFormGroup {
    const form = new UntypedFormGroup({
      name: new UntypedFormControl(null, [Validators.required, Validators.pattern(appNamePattern)]),
    });
    return form;
  }
}

interface CreateAppViewModel {
  loading: boolean;
}

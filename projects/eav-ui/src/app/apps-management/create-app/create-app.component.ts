import { AsyncPipe } from '@angular/common';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { transient } from '../../core';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';
import { appNameError, appNamePattern } from '../constants/app.patterns';
import { AppsListService } from '../services/apps-list.service';

@Component({
  selector: 'app-create-app',
  templateUrl: './create-app.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogActions,
    MatButtonModule,
    AsyncPipe,
    FieldHintComponent,
  ],
})
export class CreateAppComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;
  loading$: BehaviorSubject<boolean>;
  appNameError = appNameError;
  appTemplateId = '1';

  viewModel$: Observable<CreateAppViewModel>;

  private appsListService = transient(AppsListService);

  constructor(
    private dialogRef: MatDialogRef<CreateAppComponent>,
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

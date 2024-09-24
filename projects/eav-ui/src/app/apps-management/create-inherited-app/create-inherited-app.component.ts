import { Component, HostBinding, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../core';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';
import { App } from '../models/app.model';
import { AppsListService } from '../services/apps-list.service';

@Component({
  selector: 'app-create-inherited-app',
  templateUrl: './create-inherited-app.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogActions,
    MatButtonModule,
    FieldHintComponent
  ],
})
export class CreateInheritedAppComponent implements OnInit{
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;

  loading = signal<boolean>(false);
  inheritableApps = signal<App[] | undefined>(undefined);

  private appsListService = transient(AppsListService);

  constructor(
    private dialogRef: MatDialogRef<CreateInheritedAppComponent>,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    this.fetchInheritedApps();

  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  create(): void {
    this.form.disable();
    this.loading.set(true);
    const inheritId = this.form.controls.inheritId.value;
    // TODO:: remove after test
    // const name = this.inheritableApps$.value.find(app => app.Id === inheritId).Name;
    const name = this.inheritableApps().find(app => app.Id === inheritId).Name;
    this.snackBar.open('Creating inherited app...');
    this.appsListService.create(name, inheritId).subscribe({
      error: () => {
        this.form.enable();
    this.loading.set(false);

        this.snackBar.open('Failed to create inherited app. Please check console for more information', undefined, { duration: 3000 });
      },
      next: () => {
        this.form.enable();
        this.snackBar.open('Created inherited app', undefined, { duration: 2000 });
        this.closeDialog();
      },
    });
  }

  private fetchInheritedApps(): void {
    this.appsListService.getInheritable().subscribe({
      error: () => {
        this.inheritableApps.set(null);
      },
      next: (inheritableApps) => {
        this.inheritableApps.set(inheritableApps);
      },
    });
  }

  private buildForm(): UntypedFormGroup {
    const form = new UntypedFormGroup({
      inheritId: new UntypedFormControl(null, [Validators.required]),
    });
    return form;
  }
}

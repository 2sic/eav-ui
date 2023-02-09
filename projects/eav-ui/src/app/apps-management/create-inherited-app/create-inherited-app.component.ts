import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { App } from '../models/app.model';
import { AppsListService } from '../services/apps-list.service';

@Component({
  selector: 'app-create-inherited-app',
  templateUrl: './create-inherited-app.component.html',
  styleUrls: ['./create-inherited-app.component.scss'],
})
export class CreateInheritedAppComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;
  loading$: BehaviorSubject<boolean>;
  inheritableApps$: BehaviorSubject<App[] | undefined | null>;

  constructor(
    private dialogRef: MatDialogRef<CreateInheritedAppComponent>,
    private appsListService: AppsListService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.buildForm();
    this.loading$ = new BehaviorSubject(false);
    this.inheritableApps$ = new BehaviorSubject<App[]>(undefined);
  }

  ngOnInit(): void {
    this.fetchInheritedApps();
  }

  ngOnDestroy(): void {
    this.loading$.complete();
    this.inheritableApps$.complete();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  create(): void {
    this.form.disable();
    this.loading$.next(true);
    const inheritId = this.form.controls.inheritId.value;
    const name = this.inheritableApps$.value.find(app => app.Id === inheritId).Name;
    this.snackBar.open('Creating inherited app...');
    this.appsListService.create(name, inheritId).subscribe({
      error: () => {
        this.form.enable();
        this.loading$.next(false);
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
        this.inheritableApps$.next(null);
      },
      next: (inheritableApps) => {
        this.inheritableApps$.next(inheritableApps);
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

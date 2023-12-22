import { Component, ElementRef, HostBinding, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, Subscription, combineLatest, filter, fromEvent, map, take } from 'rxjs';
import { BaseSubsinkComponent } from '../base-subsink-component/base-subsink.component';
import { FileUploadDialogData, FileUploadMessageTypes, FileUploadResult, UploadTypes } from './file-upload-dialog.models';

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss'],
})
export class FileUploadDialogComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  @Input() uploadType: UploadTypes;

  @ViewChild('installerWindow') installerWindow: ElementRef;

  uploading$ = new BehaviorSubject<boolean>(false);
  files$ = new BehaviorSubject<File[]>([]);
  result$ = new BehaviorSubject<FileUploadResult>(undefined);
  FileUploadMessageTypes = FileUploadMessageTypes;
  UploadTypes = UploadTypes;
  showAppCatalog$ = new BehaviorSubject<boolean>(false);

  viewModel$: Observable<FileUploadDialogViewModel>;


  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: FileUploadDialogData,
    private dialogRef: MatDialogRef<FileUploadDialogComponent>,
    private snackBar: MatSnackBar,
  ) { 
    super();
  }

  // private alreadyProcessing = false;

  // // Initial Observable to monitor messages
  // private messages$ = fromEvent(window, 'message').pipe(

  //   // Ensure only one installation is processed.
  //   filter(() => !this.alreadyProcessing),

  //   // Get data from event.
  //   map((evt: MessageEvent) => {
  //     try {
  //       return JSON.parse(evt.data) as CrossWindowMessage;
  //     } catch (e) {
  //       console.error('error procesing message. Message was ' + evt.data, e);
  //       return void 0;
  //     }
  //   }),

  //   // Check if data is valid and the moduleID matches
  //   filter(data => data && Number(data.moduleId) === Config.moduleId()),
  // );

  ngOnInit(): void {
    this.subscription.add(
      this.files$.subscribe(() => {
        if (this.result$.value !== undefined) {
          this.result$.next(undefined);
        }
      }),
    );

    if (this.dialogData.files != null) {
      this.filesDropped(this.dialogData.files);
    }

    this.viewModel$ = combineLatest([
      this.uploading$, this.files$, this.result$, this.showAppCatalog$,
    ]).pipe(map(([uploading, files, result, showAppCatalog]) => ({ uploading, files, result, showAppCatalog })));

    // const winFrame = this.installerWindow.nativeElement as HTMLIFrameElement;
    // const specsMsg: SpecsForInstaller = {
    //   action: 'specs',
    //   data: {
    //     installedApps: this.settings.installedApps,
    //     rules: this.settings.rules,
    //   },
    // };
    // const specsJson = JSON.stringify(specsMsg);
    // winFrame.contentWindow.postMessage(specsJson, '*');
  }

  ngOnDestroy(): void {
    this.uploading$.complete();
    this.files$.complete();
    this.result$.complete();
    super.ngOnDestroy();
  }

  closeDialog(refresh?: boolean): void {
    this.dialogRef.close(refresh);
  }

  filesDropped(files: File[]): void {
    this.setFiles(files);
    this.upload();
  }

  filesChanged(event: Event): void {
    const fileList = (event.target as HTMLInputElement).files;
    const files = Array.from(fileList);
    this.setFiles(files);
  }

  upload(): void {
    this.uploading$.next(true);
    this.subscription.add(
      this.dialogData.upload$(this.files$.value).pipe(take(1)).subscribe({
        next: (result) => {
          this.uploading$.next(false);
          this.result$.next(result);
        },
        error: () => {
          this.uploading$.next(false);
          this.result$.next(undefined);
          this.snackBar.open('Upload failed. Please check console for more information', undefined, { duration: 3000 });
        },
      }),
    );
  }

  showAppCatalog(): void { 
    this.showAppCatalog$.next(!this.showAppCatalog$.value);
  }

  private setFiles(files: File[]): void {
    if (!this.dialogData.multiple) {
      files = files.slice(0, 1);
    }
    this.files$.next(files);
  }
}

interface FileUploadDialogViewModel {
  uploading: boolean;
  files: File[];
  result: FileUploadResult;
  showAppCatalog: boolean;
}

interface SpecsForInstaller {
  action: 'specs';
  data: InstallSpecs;
}

interface InstallSpecs {
  installedApps?: InstalledApp[];
  rules?: InstallRule[];
}

interface InstalledApp {
  name: string;
  version: string;
  guid: string;
}

interface InstallRule {
  target: string;
  mode: string;
  appGuid: string;
  url: string;
}

interface CrossWindowMessage {
  action: string;
  moduleId: string | number; // probably string, must safely convert to Number()
  packages: InstallPackage[];
}

interface InstallPackage {
  displayName: string;
  url: string;
}
import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { EditInitializerService, LoggingService } from '../../shared/services';
import { EditEntryViewModel } from './edit-entry.models';
import { AsyncPipe } from '@angular/common';
import { EditDialogMainComponent } from '../main/edit-dialog-main.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-edit-entry',
    templateUrl: './edit-entry.component.html',
    styleUrls: ['./edit-entry.component.scss'],
    providers: [LoggingService, EditInitializerService],
    standalone: true,
    imports: [
        RouterOutlet,
        EditDialogMainComponent,
        AsyncPipe,
    ],
})
export class EditEntryComponent implements OnInit {
  viewModel$: Observable<EditEntryViewModel>;

  constructor(private editInitializerService: EditInitializerService) { }

  ngOnInit(): void {
    this.viewModel$ = combineLatest([this.editInitializerService.loaded$]).pipe(
      map(([loaded]) => {
        const viewModel: EditEntryViewModel = {
          loaded,
        };
        return viewModel;
      }),
    );
    this.editInitializerService.fetchFormData();
  }
}

import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { AdamService, EavService, EditInitializerService, EntityService, LoadIconsService, LoggingService, QueryService, ScriptsLoaderService } from '../../shared/services';
import { EditEntryViewModel } from './edit-entry.models';
import { AsyncPipe } from '@angular/common';
import { EditDialogMainComponent } from '../main/edit-dialog-main.component';
import { RouterOutlet } from '@angular/router';
import { MatDayjsDateAdapter } from '../../shared/date-adapters/date-adapter-api';

@Component({
  selector: 'app-edit-entry',
  templateUrl: './edit-entry.component.html',
  styleUrls: ['./edit-entry.component.scss'],
  providers: [
    LoggingService,
    EditInitializerService,
    EavService,
    LoadIconsService,
    EntityService,
    QueryService,
    MatDayjsDateAdapter,
    AdamService,
    ScriptsLoaderService
  ],
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

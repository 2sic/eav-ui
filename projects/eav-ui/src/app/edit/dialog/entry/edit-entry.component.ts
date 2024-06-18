import { Component, OnInit } from '@angular/core';
import { EditInitializerService, LoggingService } from '../../shared/services';
import { AsyncPipe } from '@angular/common';
import { EditDialogMainComponent } from '../main/edit-dialog-main.component';
import { RouterOutlet } from '@angular/router';
import { FormDataService } from '../../shared/services/form-data.service';

@Component({
  selector: 'app-edit-entry',
  templateUrl: './edit-entry.component.html',
  styleUrls: ['./edit-entry.component.scss'],
  imports: [
    RouterOutlet,
    EditDialogMainComponent,
    AsyncPipe,
  ],
  providers: [
    LoggingService,
    EditInitializerService,
    FormDataService,
    // EavService,
    // LoadIconsService,
    // EntityService,
    // QueryService,
    // MatDayjsDateAdapter,
    // AdamService,
    // ScriptsLoaderService
  ],
  standalone: true,
})
export class EditEntryComponent implements OnInit {

  constructor(protected editInitializerService: EditInitializerService) { }

  ngOnInit(): void {
    this.editInitializerService.fetchFormData();
  }
}

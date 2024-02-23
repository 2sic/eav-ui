import { Component } from '@angular/core';
import { ContentTypesService } from '../services';
import { BehaviorSubject, map } from 'rxjs';
import { ContentType } from '../models';
import { MatSelectModule } from '@angular/material/select';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DevRestDataComponent } from '../../dev-rest/data/data.component';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-data-rest-api',
  standalone: true,
  imports: [MatSelectModule, MatButtonModule,
    MatCardModule, MatIconModule, ReactiveFormsModule, AsyncPipe, DevRestDataComponent, RouterOutlet],
  providers: [ContentTypesService],
  templateUrl: './data-rest-api.component.html',
  styleUrl: './data-rest-api.component.scss'
})
export class DataRestApiComponent {

  contentTypes$ = new BehaviorSubject<ContentType[]>(undefined);
  contentTypes: ContentType[] = [];

  contentTypeForm: FormGroup;


  constructor(private contentTypesService: ContentTypesService, private fb: FormBuilder,
  private router: Router) { }

  ngOnInit() {
    this.fetchData();
    this.contentTypeForm = this.fb.group({
      contentType: ['']
    });
    // Test Log
  }

  fetchData() {
    this.contentTypesService.retrieveContentTypes("Default").subscribe(
      (contentTypes: ContentType[]) => {
        this.contentTypes$.next(contentTypes);
      }
    );
  }

  openRestApi(event: string): void {
    if (!event) return;
    this.router.navigate([`/data/${event}`]);
  }
}

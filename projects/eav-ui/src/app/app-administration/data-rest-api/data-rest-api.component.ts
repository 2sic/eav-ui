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

@Component({
  selector: 'app-data-rest-api',
  standalone: true,
  imports: [MatSelectModule, MatButtonModule,
    MatCardModule, MatIconModule, ReactiveFormsModule, AsyncPipe, DevRestDataComponent],
  providers: [ContentTypesService],
  templateUrl: './data-rest-api.component.html',
  styleUrl: './data-rest-api.component.scss'
})
export class DataRestApiComponent {

  contentTypes$ = new BehaviorSubject<ContentType[]>(undefined);
  contentType$ = new BehaviorSubject<ContentType>(undefined);

  contentTypeForm: FormGroup;

  constructor(private contentTypesService: ContentTypesService, private fb: FormBuilder,) { }

  ngOnInit() {

    this.contentTypeForm = this.fb.group({
      contentType: ['']
    });

    this.contentTypesService.retrieveContentTypes("Default").subscribe(
      (contentTypes: ContentType[]) => {
        this.contentTypes$.next(contentTypes);
      },
      (error) => {
        console.error("Fehler beim Abrufen der Inhaltsarten:", error);
      }
    );
  }

  openRestApi(event: string): void {
    if (!event) return; // Sicherstellen, dass event definiert ist und nicht leer ist

    this.contentTypes$.pipe(
      map((contentTypes: ContentType[]) => {
        const foundContentType = contentTypes.find((contentType: ContentType) => {
          return contentType.Label === event;
        });

        if (foundContentType) {
          this.contentType$.next(foundContentType);
        }
      })
    )

  }
}


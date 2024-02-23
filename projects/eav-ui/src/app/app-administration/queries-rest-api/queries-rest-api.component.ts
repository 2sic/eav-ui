import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { PipelinesService } from '../services';
import { BehaviorSubject } from 'rxjs';
import { DevRestQueryComponent } from '../../dev-rest/query/query.component';
import { eavConstants } from '../../shared/constants/eav.constants';
import { Query } from '../models';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-queries-rest-api',
  standalone: true,
  imports: [MatSelectModule, MatButtonModule,
    MatCardModule, MatIconModule, ReactiveFormsModule, AsyncPipe, DevRestQueryComponent, RouterOutlet],
  providers: [PipelinesService],
  templateUrl: './queries-rest-api.component.html',
  styleUrl: './queries-rest-api.component.scss'
})
export class QueriesRestApiComponent {

  queryTypes$ = new BehaviorSubject<Query[]>(undefined);
  queryTypeForm: FormGroup;

  constructor(private fb: FormBuilder, private pipelinesService: PipelinesService, private router: Router
  ) { }

  ngOnInit() {

    this.fetchQueries();
    this.queryTypeForm = this.fb.group({
      queryType: ['']
    });
  }

  fetchQueries() {
    this.pipelinesService.getAll(eavConstants.contentTypes.query).subscribe((queries: Query[]) => {
      console.log(queries);
      this.queryTypes$.next(queries);
    });
  }

  openRestApi(event: string): void {
    if (!event) return;
    this.router.navigate([`/query/${event}`]);
  }
}

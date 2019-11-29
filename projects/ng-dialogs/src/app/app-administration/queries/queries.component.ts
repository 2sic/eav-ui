import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Context } from '../../shared/context/context';
import { Query } from '../shared/models/query.model';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.scss']
})
export class QueriesComponent implements OnInit {
  @Input() context: Context;
  private contentType = 'DataPipeline';
  queries: Query[];

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.http.get(`/desktopmodules/2sxc/api/eav/Entities/GetEntities?appId=${this.context.appId}&contentType=${this.contentType}`)
      .subscribe((queries: Query[]) => {
        this.queries = queries;
      });
  }

}

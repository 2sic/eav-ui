import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Context } from '../../shared/context/context';
import { ContentType } from '../shared/models/content-types.model';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit {
  @Input() context: Context;
  private scope = '2SexyContent'; // spm figure out how scope works
  contentTypes: ContentType[];

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.http.get(`/desktopmodules/2sxc/api/eav/contenttype/get/?appId=${this.context.appId}&scope=${this.scope}`)
      .subscribe((contentTypes: ContentType[]) => {
        this.contentTypes = contentTypes;
      });
  }

}

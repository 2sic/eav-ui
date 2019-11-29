import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Context } from '../../shared/context/context';
import { View } from '../shared/models/view.model';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss']
})
export class ViewsComponent implements OnInit {
  @Input() context: Context;
  views: View[];

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.http.get(`/desktopmodules/2sxc/api/app-sys/template/getall?appId=${this.context.appId}`)
      .subscribe((views: View[]) => {
        this.views = views;
      });
  }

}

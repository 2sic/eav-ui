import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Context } from '../shared/services/context';

@Component({
  selector: 'app-visual-query',
  templateUrl: './visual-query.component.html',
  styleUrls: ['./visual-query.component.scss']
})
export class VisualQueryComponent implements OnInit {

  constructor(private context: Context, private route: ActivatedRoute) {
    this.context.init(this.route);
  }

  ngOnInit() {
  }

}

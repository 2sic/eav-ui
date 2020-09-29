import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GettingStartedComponent implements OnInit {
  @Input() gettingStartedUrl: string;

  constructor() { }

  ngOnInit() {
  }

}

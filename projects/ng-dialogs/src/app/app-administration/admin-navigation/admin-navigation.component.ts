import { Component, OnInit, Inject } from '@angular/core';
import { TestToken } from '../test-token';
import { AppToken } from '../app-token';

@Component({
  selector: 'app-admin-navigation',
  templateUrl: './admin-navigation.component.html',
  styleUrls: ['./admin-navigation.component.scss']
})
export class AdminNavigationComponent implements OnInit {

  constructor(
    @Inject(TestToken) private value: string,
    @Inject(AppToken) private appId: string
  ) {
    const historyState = window.history.state;
    // console.log('INJECTED:', value, 'REAL VALUE:', historyState);
    console.log('INJECTED:', appId, 'REAL VALUE:', historyState.appId);
    debugger;
  }

  ngOnInit() {
  }

}

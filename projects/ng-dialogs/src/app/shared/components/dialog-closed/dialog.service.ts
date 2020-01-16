import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';


@Injectable()
export class DialogService {
  constructor(
    private router: Router,
  ) { }

  /** Returns observable on dialog closed message. Closes itself if message is received, otherwise it has to be closed from outside */
  subToClosed(message: string) {
    return <Observable<NavigationEnd>>this.router.events.pipe(
      filter(event => {
        if (!(event instanceof NavigationEnd)) { return false; }
        const navigation = this.router.getCurrentNavigation();
        if (!navigation.extras.state) { return false; }
        return navigation.extras.state.message === message;
      }),
      take(1),
    );
  }

}

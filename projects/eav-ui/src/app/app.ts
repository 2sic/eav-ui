import { Context as DnnContext, SxcAppComponent } from '@2sic.com/sxc-angular';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { transient } from '../../../core';
import { keyContentBlockId, keyModuleId } from './shared/constants/session.constants';
import { AppIconsService } from './shared/icons/app-icons.service';
import { Context } from './shared/services/context';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    MatProgressSpinnerModule
  ]
})
export class AppComponent extends SxcAppComponent implements OnInit, OnDestroy {
  #subscriptions = new Subscription();

  #titleSvc = transient(Title);
  #appIconsSvc = transient(AppIconsService);

  // loader signal
  isLoading = signal(true);

  constructor(
    el: ElementRef,
    dnnContext: DnnContext,
    private context: Context,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    super(
      el,
      dnnContext.preConfigure({
        moduleId: parseInt(sessionStorage.getItem(keyModuleId) || '-1234', 10),
        contentBlockId: parseInt(sessionStorage.getItem(keyContentBlockId) || '-1234', 10),
      }),
    );
    this.context.initRoot();
    this.#appIconsSvc.load();
  }

  ngOnInit() {
    // Mostly copied from https://blog.bitsrc.io/dynamic-page-titles-in-angular-98ce20b5c334
    // Routes need a data: { title: '...' } for this to work
    const appTitle = this.#titleSvc.getTitle(); // initial title when loading the page
    this.#subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let child = this.activatedRoute.firstChild;
          while (child?.firstChild)
            child = child.firstChild;
          return child?.snapshot.data['title'] ?? appTitle;
        }),
      ).subscribe((title: string) => {
        this.#titleSvc.setTitle(title);
        this.isLoading.set(false);
      })
    );
  }

  ngOnDestroy() {
    this.#subscriptions.unsubscribe();
  }
}
import { Context as DnnContext, SxcAppComponent } from '@2sic.com/sxc-angular';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { AppIconsService } from './shared/icons/app-icons.service';
import { keyContentBlockId, keyModuleId } from './shared/constants/session.constants';
import { Context } from './shared/services/context';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends SxcAppComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  constructor(
    el: ElementRef,
    dnnContext: DnnContext,
    private context: Context,
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appIconsService: AppIconsService,
  ) {
    super(
      el,
      dnnContext.preConfigure({
        moduleId: parseInt(sessionStorage.getItem(keyModuleId) || '-1234', 10),
        contentBlockId: parseInt(sessionStorage.getItem(keyContentBlockId) || '-1234', 10),
      }),
    );
    this.context.initRoot();
    this.appIconsService.load();
  }

  ngOnInit() {
    // Mostly copied from https://blog.bitsrc.io/dynamic-page-titles-in-angular-98ce20b5c334
    // Routes need a data: { title: '...' } for this to work
    const appTitle = this.titleService.getTitle(); // initial title when loading the page
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let child = this.activatedRoute.firstChild;
          while (child?.firstChild) {
            child = child.firstChild;
          }
          if (child?.snapshot.data['title']) {
            return child.snapshot.data['title'];
          }
          return appTitle;
        }),
      ).subscribe((title: string) => {
        this.titleService.setTitle(title);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

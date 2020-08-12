import { Component, ElementRef, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DnnAppComponent, Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from './shared/services/context';
import { keyModuleId, keyContentBlockId } from './shared/constants/session.constants';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends DnnAppComponent implements OnInit {
  constructor(el: ElementRef,
    dnnContext: DnnContext,
    private context: Context,
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private matIconRegistry: MatIconRegistry
  ) {
    super(
      el,
      dnnContext.preConfigure({
        moduleId: parseInt(sessionStorage.getItem(keyModuleId), 10),
        contentBlockId: parseInt(sessionStorage.getItem(keyContentBlockId), 10),
      }),
    );
    this.context.initRoot();
    this.matIconRegistry.setDefaultFontSetClass('material-icons-outlined');
  }

  ngOnInit() {
    //#region Set title based on route information
    // Mostly copied from https://blog.bitsrc.io/dynamic-page-titles-in-angular-98ce20b5c334
    // Routes need a data: {title: '...'} for this to work
    const appTitle = this.titleService.getTitle();  // initial title when loading the page
    this.router
      .events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let child = this.activatedRoute.firstChild;
          while (child.firstChild) {
            child = child.firstChild;
          }
          if (child.snapshot.data['title']) {
            return child.snapshot.data['title'];
          }
          return appTitle;
        })
      ).subscribe((ttl: string) => {
        this.titleService.setTitle(ttl);
      });
    //#endregion
  }
}

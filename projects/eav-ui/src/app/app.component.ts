import codeCurly from '!raw-loader!./assets/icons/code-curly.svg';
import { Context as DnnContext, DnnAppComponent } from '@2sic.com/dnn-sxc-angular';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { keyContentBlockId, keyModuleId } from './shared/constants/session.constants';
import { Context } from './shared/services/context';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends DnnAppComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  constructor(
    el: ElementRef,
    dnnContext: DnnContext,
    private context: Context,
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    super(
      el,
      dnnContext.preConfigure({
        moduleId: parseInt(sessionStorage.getItem(keyModuleId) || '-1234', 10),
        contentBlockId: parseInt(sessionStorage.getItem(keyContentBlockId) || '-1234', 10),
      }),
    );
    this.context.initRoot();
    this.loadFonts();
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

  private loadFonts() {
    this.matIconRegistry.setDefaultFontSetClass('material-icons-outlined');

    const icons: Record<string, string> = {
      'code-curly': codeCurly,
    };
    Object.entries(icons).forEach(([name, svg]) => {
      this.matIconRegistry.addSvgIconLiteral(name, this.domSanitizer.bypassSecurityTrustHtml(svg));
    });
  }
}

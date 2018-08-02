import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { EavService } from '../services/eav.service';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
    private eavConfig;

    constructor(private eavService: EavService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.eavConfig) {
            this.eavConfig = this.eavService.getEavConfiguration();
        }
        const modified = req.clone({
            setHeaders: {
                'TabId': this.eavConfig.tid,
                'ContentBlockId': this.eavConfig.cbid,
                'ModuleId': this.eavConfig.mid,
                'Content-Type': 'application/json;charset=UTF-8',
                'RequestVerificationToken': 'abcdefgihjklmnop'
            }
        });
        return next.handle(modified);
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PipelinesService {
  constructor(
    private http: HttpClient,
  ) { }

  getAll(appId: number, contentType: string) {
    return this.http.get(`/desktopmodules/2sxc/api/eav/Entities/GetEntities?appId=${appId}&contentType=${contentType}`);
  }

}

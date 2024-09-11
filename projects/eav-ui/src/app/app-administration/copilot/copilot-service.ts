import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Context } from '../../shared/services/context';
import { EditionData, EditionDataDto } from './edition-data';
import { map, shareReplay } from 'rxjs';
import { Edition, EditionDto } from './edition';
import { classLog } from '../../shared/logging';

@Injectable()
export class CopilotService {
  
  log = classLog({CopilotService});

  static webApiEditions: string = 'admin/code/getEditions';
  static webApiGeneratedCode: string = 'admin/code/generateDataModels';

  public specs = this.#getCopilotSpecs();

  constructor(private http: HttpClient, private context: Context) { }

  getEditions() {
    return this.specs.pipe(map(data => data.editions));
  }

  getDefaultEdition() {
    return this.specs.pipe(map(data => data.editions.find(e => e.isDefault)));
  }

  getGenerators() {
    return this.specs.pipe(map(data => data.generators));
  }

  #getCopilotSpecs() {
    return this.http.get<EditionDataDto>(CopilotService.webApiEditions, {
      params: {
        appId: this.context.appId.toString()
      }
    }).pipe(
      map((data) => {
        const defaultOrFirst = this.#findDefaultEdition(data.editions);
        const editions = data.editions.map(d => {
          const isDefault = d == defaultOrFirst;
          return {
            ...d,
            isDefault,
            description: (d.description || "no description provided") + (isDefault ? ' ✅' : ''),
            label: `/${d.name}/AppCode/Data`.replace(/\/\//g, '/'),
          } as Edition;
        });

        return { ...data, editions } as EditionData;
      }),
      shareReplay(1),
    );
  }

  #findDefaultEdition(editions: EditionDto[]): EditionDto {
    return editions.find(d => d.isDefault) ?? editions.find(d => d.name === '') ?? editions[0];
  }

}
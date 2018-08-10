import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class FieldMaskService {

  // private mask: string;
  // model: $scope.model,
  private fields: string[] = [];
  // value: undefined,
  private findFields = /\[.*?\]/ig;
  private unwrapField = /[\[\]]/ig;


  // construct a object which has liveListCache, liveListReload(), liveListReset(),
  constructor(private mask: string,
    private changeEvent: any,
    private overloadPreCleanValues: any) {
    this.mask = mask;

    this.fields = this.fieldList();

    if (overloadPreCleanValues) { // got an overload...
      this.preClean = overloadPreCleanValues;
    }
  }

  public preClean = (key, value) => {
    return value;
  }

  // retrieves a list of all fields used in the mask
  private fieldList = () => {
    const result = [];
    if (!this.mask) { return result; }
    console.log('mask:', this.mask);
    const matches = this.mask.match(this.findFields);
    console.log('matches:', matches);
    if (matches) {
      matches.forEach((e, i) => {
        const staticName = e.replace(this.unwrapField, '');
        result.push(staticName);
      });
    } else { // TODO: ask is this good
      result.push(this.mask);
    }
    return result;
  }

}


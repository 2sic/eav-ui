export class FormSet {
  formId: number;
  entityGuid: string;
  entityValues: { [name: string]: any };
}

export class FormDisabledSet {
  formId: number;
  entityGuid: string;
}

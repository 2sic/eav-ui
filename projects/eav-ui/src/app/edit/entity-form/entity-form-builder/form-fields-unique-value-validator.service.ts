import { inject, Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, shareReplay, timer } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { transient } from '../../../../../../core';
import { QueryService } from '../../../shared/services/query.service';
import { ContentTypeService } from '../../shared/content-types/content-type.service';
import { EavContentTypeAttribute } from '../../shared/models/eav';
import { ValidationHelperSpecs } from '../../shared/validation/validation.helpers';
import { ItemFieldVisibility } from '../../state/item-field-visibility';

type UniqueValueValidationResult = {
  IsValid?: boolean;
  Reason?: string;
  ConflictEntityId?: number;
  ConflictGuid?: string;
  ConflictTitle?: string;
};

type UniqueValueValidationRequest = {
  contentTypeName: string;
  fieldName: string;
  value: string;
  currentEntityGuid: string;
  currentEntityId: number;
  language: string;
};

type UniqueValueValidationCache = {
  // Angular can cancel debounced async validators before they hit the backend.
  // We only reuse a cached result after one request completed for this exact key.
  requestKey: string;
  hasResult: boolean;
  result: ValidationErrors | null;
  pending$?: Observable<ValidationErrors | null>;
};

const supportedUniqueValidationTypes = new Set(['String', 'Hyperlink', 'Custom', 'Number', 'DateTime']);
const uniqueValueValidationDelay = 300;

@Injectable()
export class FormFieldsUniqueValueValidatorService {
  #queryService = transient(QueryService);
  #contentTypeService = inject(ContentTypeService);
  #cache = new WeakMap<AbstractControl, UniqueValueValidationCache>();

  create(specs: ValidationHelperSpecs): AsyncValidatorFn | null {
    const attribute = this.#fieldAttribute(specs);
    if (attribute === null || !this.#shouldValidateUniqueValue(attribute))
      return null;

    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (control.disabled || !ItemFieldVisibility.mergedVisible(specs.settings()) || control.pristine)
        return this.#clearCacheAndNull(control);

      const normalizedValue = this.#normalizedValue(control.value);
      if (normalizedValue === null)
        return this.#clearCacheAndNull(control);

      const request = this.#buildRequest(specs, normalizedValue);
      const requestKey = this.#queryParams(request);

      const cached = this.#cache.get(control);
      if (cached?.requestKey === requestKey)
        return cached.pending$
          ?? (cached.hasResult ? of(cached.result) : this.#startRequest(control, requestKey));

      return this.#startRequest(control, requestKey);
    };
  }

  #startRequest(control: AbstractControl, requestKey: string): Observable<ValidationErrors | null> {
    const pending$ = timer(uniqueValueValidationDelay).pipe(
      switchMap(() => this.#queryService.getFromQuery(
        'System.SysData/Default',
        requestKey,
        'IsValid,Reason,ConflictEntityId,ConflictGuid,ConflictTitle',
      )),
      map(streams => this.#validationError(streams?.Default?.[0] as UniqueValueValidationResult | undefined)),
      catchError(() => of(null)),
      tap(result => this.#setResult(control, requestKey, result)),
      finalize(() => this.#clearPending(control, requestKey)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.#cache.set(control, {
      requestKey,
      hasResult: false,
      result: null,
      pending$,
    });

    return pending$;
  }

  #clearCacheAndNull(control: AbstractControl): Observable<ValidationErrors | null> {
    this.#cache.delete(control);
    return of(null);
  }

  #setResult(control: AbstractControl, requestKey: string, result: ValidationErrors | null): void {
    const current = this.#cache.get(control);
    if (current?.requestKey !== requestKey)
      return;

    current.hasResult = true;
    current.result = result;
  }

  #clearPending(control: AbstractControl, requestKey: string): void {
    const current = this.#cache.get(control);
    if (current?.requestKey !== requestKey)
      return;

    current.pending$ = undefined;
  }

  #buildRequest(specs: ValidationHelperSpecs, normalizedValue: string): UniqueValueValidationRequest {
    const props = specs.props();

    return {
      contentTypeName: props.constants.contentTypeNameId,
      fieldName: props.constants.fieldName,
      value: normalizedValue,
      currentEntityGuid: props.constants.entityGuid ?? '',
      currentEntityId: props.constants.entityId ?? 0,
      language: props.translationState?.language ?? '',
    };
  }

  #fieldAttribute(specs: ValidationHelperSpecs): EavContentTypeAttribute | null {
    try {
      const { contentTypeNameId, fieldName } = specs.props().constants;
      return this.#contentTypeService.get(contentTypeNameId)?.Attributes.find(attribute => attribute.Name === fieldName) ?? null;
    } catch {
      return null;
    }
  }

  #shouldValidateUniqueValue(attribute: EavContentTypeAttribute): boolean {
    if (!supportedUniqueValidationTypes.has(attribute.Type))
      return false;

    const explicitUnique = this.#toBoolean(attribute.Settings.IsUnique?.Values?.[0]?.value);
    const isUrlPath = attribute.Type === 'String' && attribute.InputType?.toLowerCase() === 'string-url-path';
    return explicitUnique ?? isUrlPath;
  }

  #normalizedValue(value: unknown): string | null {
    if (value === undefined || value === null)
      return null;

    const normalized = String(value);
    return normalized.trim() === '' ? null : normalized;
  }

  #toBoolean(value: unknown): boolean | undefined {
    if (typeof value === 'boolean')
      return value;

    if (typeof value === 'number')
      return value === 1
        ? true
        : value === 0
          ? false
          : undefined;

    if (typeof value !== 'string')
      return undefined;

    const normalized = value.trim().toLowerCase();
    return normalized === 'true'
      ? true
      : normalized === 'false'
        ? false
        : undefined;
  }

  #queryParams(values: UniqueValueValidationRequest): string {
    const encode = (value: string | number): string => encodeURIComponent(String(value));
    return [
      'SysDataSource=System.UniqueValueValidation',
      `ContentTypeName=${encode(values.contentTypeName)}`,
      `FieldName=${encode(values.fieldName)}`,
      `Value=${encode(values.value)}`,
      `CurrentEntityGuid=${encode(values.currentEntityGuid)}`,
      `CurrentEntityId=${encode(values.currentEntityId)}`,
      `Language=${encode(values.language)}`,
    ].join('&');
  }

  #validationError(result?: UniqueValueValidationResult): ValidationErrors | null {
    if ((result === undefined || result === null) || result.IsValid !== false || result.Reason !== 'duplicate')
      return null;

    return {
      uniqueValue: {
        reason: result.Reason,
        conflictEntityId: result.ConflictEntityId,
        conflictGuid: result.ConflictGuid,
        conflictTitle: result.ConflictTitle,
      },
    };
  }
}
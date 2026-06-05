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

/** Types which support unique value validation */
const supportedUniqueValidationTypes = new Set(['String', 'Hyperlink', 'Custom', 'Number', 'DateTime']);

/** Debounce delay for the async unique value validation */
const uniqueValueValidationDelay = 300;

/**
 * Service to create async validators for unique value validation of form fields.
 * It checks if a value is unique across entities for a given content type and field.
 * The validation is triggered based on specific field settings and types.
 * It also implements caching to avoid redundant backend calls for the same value.
 */
@Injectable()
export class FormFieldsUniqueValueValidatorService {
  #queryService = transient(QueryService);
  #contentTypeService = inject(ContentTypeService);
  #cache = new WeakMap<AbstractControl, UniqueValueValidationCache>();

  /**
   * Factory to create an async validator function for unique value validation of form fields.
   * But only if it's configured to be used.
   * @param specs 
   * @returns 
   */
  create(specs: ValidationHelperSpecs): AsyncValidatorFn | null {
    const attribute = this.#findAttributeDefinition(specs);
    if (attribute === null || !this.#shouldValidateUniqueValue(attribute))
      return null;

    // Return a function that will be used as an async validator for the form control.
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // Skip if disabled or not visible or pristine, and also clear any cached validation result in that case.
      if (control.disabled || !ItemFieldVisibility.mergedVisible(specs.settings()) || control.pristine)
        return this.#clearCacheAndNull(control);

      const nullOrTrimmedString = this.#nullOrTrimmedString(control.value);
      if (nullOrTrimmedString === null)
        return this.#clearCacheAndNull(control);

      const requestKey = this.#queryParams(specs, nullOrTrimmedString);

      const cached = this.#cache.get(control);
      if (cached?.requestKey === requestKey)
        return cached.pending$
          ?? (cached.hasResult
            ? of(cached.result)
            : this.#startRequest(control, requestKey)
          );

      return this.#startRequest(control, requestKey);
    };
  }

  /** Start a validation request for the given control and request key */
  #startRequest(control: AbstractControl, requestKey: string): Observable<ValidationErrors | null> {
    const pending$ = timer(uniqueValueValidationDelay).pipe(
      switchMap(() => this.#queryService.getFromQuery(
        'System.SysData/Default',
        requestKey,
        'IsValid,Reason,ConflictEntityId,ConflictGuid,ConflictTitle',
      )),
      map(streams => this.#buildValidationError(streams?.Default?.[0] as UniqueValueValidationResult | undefined)),
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

  /** Clear the cache for the given control and return null */
  #clearCacheAndNull(control: AbstractControl): Observable<ValidationErrors | null> {
    this.#cache.delete(control);
    return of(null);
  }

  /** Set the result for the given control and request key */
  #setResult(control: AbstractControl, requestKey: string, result: ValidationErrors | null): void {
    const current = this.#cache.get(control);
    if (current?.requestKey !== requestKey)
      return;

    current.hasResult = true;
    current.result = result;
  }

  /** Clear the pending observable for the given control and request key */
  #clearPending(control: AbstractControl, requestKey: string): void {
    const current = this.#cache.get(control);
    if (current?.requestKey !== requestKey)
      return;

    current.pending$ = undefined;
  }

  #findAttributeDefinition(specs: ValidationHelperSpecs): EavContentTypeAttribute | null {
    try {
      const { contentTypeNameId, fieldName } = specs.props().constants;
      return this.#contentTypeService
        .get(contentTypeNameId)?.Attributes
        .find(attribute => attribute.Name === fieldName)
        ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Determine whether unique value validation should be applied for the given attribute.
   * Based on  explicit "IsUnique" setting or implicit type "string-url-path" for string fields.
   * @param attribute The attribute to check for unique value validation.
   * @returns True if unique value validation should be applied, false otherwise.
   */
  #shouldValidateUniqueValue(attribute: EavContentTypeAttribute): boolean {
    if (!supportedUniqueValidationTypes.has(attribute.Type))
      return false;

    const toggleOrNull = attribute.Settings.IsUnique?.Values?.[0]?.value;
    if(/* this.#toBoolean( */ !!toggleOrNull /* ) */)
      return true;

    const isUrlPath = attribute.InputType?.toLowerCase() === 'string-url-path';
    // In any case, if explicitly set, use that, otherwise default to true for "string-url-path" and false for other types.
    return toggleOrNull ?? isUrlPath;
  }

  #nullOrTrimmedString(value: unknown): string | null {
    if (value == null)
      return null;

    const normalized = String(value);
    return normalized.trim() === '' ? null : normalized;
  }

  #queryParams(specs: ValidationHelperSpecs, normalizedValue: string): string {
    // not sure why we have a helper function, could be because of dates.
    const encode = (v: string | number): string => encodeURIComponent(String(v));

    const props = specs.props();
    const constants = props.constants;

    return [
      'SysDataSource=System.UniqueValueValidation',
      `ContentTypeName=${encode(constants.contentTypeNameId)}`,
      `FieldName=${encode(constants.fieldName)}`,
      `Value=${encode(normalizedValue)}`,
      `CurrentEntityGuid=${encode(constants.entityGuid ?? '')}`,
      `CurrentEntityId=${encode(constants.entityId ?? 0)}`,
      `Language=${encode(props.translationState?.language ?? '')}`,
    ].join('&');
  }

  #buildValidationError(result?: UniqueValueValidationResult): ValidationErrors | null {
    if (result == null || result.IsValid !== false || result.Reason !== 'duplicate')
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


type UniqueValueValidationResult = {
  IsValid?: boolean;
  Reason?: string;
  ConflictEntityId?: number;
  ConflictGuid?: string;
  ConflictTitle?: string;
};

type UniqueValueValidationCache = {
  // Angular can cancel debounced async validators before they hit the backend.
  // We only reuse a cached result after one request completed for this exact key.
  requestKey: string;
  hasResult: boolean;
  result: ValidationErrors | null;
  pending$?: Observable<ValidationErrors | null>;
};
import { effect } from '@angular/core';
import type { AbstractControl } from '@angular/forms';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

export interface SyncFormWithLastUrlSegmentOptions<TItem> {
    items: () => readonly TItem[];
    control: () => AbstractControl | null;

    // last URL segment -> normalized key
    decode?: (segment: string) => string;

    // item -> key to compare
    itemKey: (item: TItem) => string;

    // optional filter/transform on key
    normalizeKey?: (key: string) => string;

    // optional hook for logging
    onMatch?: (match: TItem | undefined, ctx: { segment?: string; key?: string }) => void;
}

/**
 * Keeps a form control in sync with the last segment of the dialog route.
 * - waits until items are loaded
 * - reads last url segment
 * - decodes / normalizes it
 * - finds matching item
 * - sets control value (without emitting)
 */
const identity = <T>(value: T) => value;

export function syncFormWithLastUrlSegment<TItem>(
    dialogRouter: DialogRoutingService,
    opts: SyncFormWithLastUrlSegmentOptions<TItem>,
    ): void {
    
    const decode = opts.decode ?? identity<string>;
    const normalize = opts.normalizeKey ?? identity<string>;

    effect(() => {
        const items = opts.items();
        if (!items?.length) 
            return;

        const segment = dialogRouter.urlSegments.at(-1);
        if (!segment) 
            return;

        const key = normalize(decode(segment));

        const match = items.find(item => normalize(opts.itemKey(item)) === key);
        opts.onMatch?.(match, { segment, key });

        const control = match ? opts.control() : null;
        if (!match || !control) 
            return;

        control.setValue(opts.itemKey(match), { emitEvent: false });
    });
}
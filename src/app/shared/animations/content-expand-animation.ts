import { trigger, state, transition, style, animate, keyframes } from '@angular/animations';

export const ContentExpandAnimation = [
    trigger('itemShrinkAnimation', [
        state('open', style({
            height: '30vh'
        })),
        state('closed', style({
            height: '0vh'
        })),
        transition('open => closed', [
            animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
        ]),
    ]),
    trigger('contentExpandAnimation', [
        state('closed', style({
            height: '0',
        })),
        state('expanded', style({
            height: 'calc(100vh - 99px)',
            'max-height': 'calc(100vh - 99px)',
        })),
        transition('closed => expanded', [
            animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', keyframes([
                style({ 'height': '0vh', overflow: 'hidden' }),
                style({ 'height': 'calc(100vh - 100px)', overflow: 'hidden' }),
            ])),
        ]),
    ]),
];


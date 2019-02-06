import { trigger, state, transition, style, animate, keyframes } from '@angular/animations';

export const SlideLeftRightAnimation = [
    trigger('slideLeft', [
        state('true', style({})),
        state('false', style({})),
        transition('void => *', animate(0)),
        transition('* => *',
            [
                animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', keyframes([
                    style({
                        transform: 'translateX(+10%)' /*standard */
                    }),
                    style({ transform: 'translateX(+20%)' }),
                    style({ transform: 'translateX(+30%)' }),
                    style({ transform: 'translateX(+40%)' }),
                    style({ transform: 'translateX(+50%)' }),
                    style({ transform: 'translateX(+60%)' }),
                    style({ transform: 'translateX(+70%)' }),
                    style({ transform: 'translateX(+80%)' }),
                    style({ transform: 'translateX(+90%)' }),
                    style({ transform: 'translateX(+100%)' }),
                    style({ transform: 'translateX(-100%)' }),
                    style({ transform: 'translateX(-90%)' }),
                    style({ transform: 'translateX(-80%)' }),
                    style({ transform: 'translateX(-70%)' }),
                    style({ transform: 'translateX(-60%)' }),
                    style({ transform: 'translateX(-50%)' }),
                    style({ transform: 'translateX(-40%)' }),
                    style({ transform: 'translateX(-30%)' }),
                    style({ transform: 'translateX(-20%)' }),
                    style({ transform: 'translateX(-10%)' }),
                ])),
            ]
        ),
    ]),
    trigger('slideRight', [
        state('true', style({})),
        state('false', style({})),
        transition('void => *', animate(0)),
        transition('* => *', [
            animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', keyframes([
                style({
                    // '-webkit-transform': 'translateX(-10%)', /* android, safari, chrome */
                    // '-moz-transform': 'translateX(-10%)', /* old firefox */
                    // '-o-transform': 'translateX(-10%)', /* old opera */
                    // '-ms-transform': 'translateX(-10%)', /* old IE */
                    transform: 'translateX(-10%)' /*standard */
                }),
                style({ transform: 'translateX(-20%)' }),
                style({ transform: 'translateX(-30%)' }),
                style({ transform: 'translateX(-40%)' }),
                style({ transform: 'translateX(-50%)' }),
                style({ transform: 'translateX(-60%)' }),
                style({ transform: 'translateX(-70%)' }),
                style({ transform: 'translateX(-80%)' }),
                style({ transform: 'translateX(-90%)' }),
                style({ transform: 'translateX(-100%)' }),
                style({ transform: 'translateX(+100%)' }),
                style({ transform: 'translateX(+90%)' }),
                style({ transform: 'translateX(+80%)' }),
                style({ transform: 'translateX(+70%)' }),
                style({ transform: 'translateX(+60%)' }),
                style({ transform: 'translateX(+50%)' }),
                style({ transform: 'translateX(+40%)' }),
                style({ transform: 'translateX(+30%)' }),
                style({ transform: 'translateX(+20%)' }),
                style({ transform: 'translateX(+10%)' }),
            ])),
        ]),
    ]),
];


export * from '../info-box/hint';
export * from './api-call';
export * from './code-sample';
export * from './generate-samples';


import { Hint } from '../info-box/hint';
export const hint$2sxc = new Hint('tip', `The <code>$2sxc</code> is a helper JS from 2sxc. It's always included for super-users (hosts).
But if you need normal visitors to use the API, you must request it in your Razor using @Edit.Enable(...).
<a href="https://r.2sxc.org/js-2sxc-root" target="_blank">see docs</a>`);

export const warningSimpleSampleOnly = new Hint('warning', `WARNING: We only prepared the basic example running in the same app. You can of course also run this elsewhere,
but you'll have to compare it with the GET examples to be sure you have the right headers etc. `, '');

export const warningExternal = new Hint('alert', 'IMPORTANT: This will only work if you set anonymous permissions on the content-type.');

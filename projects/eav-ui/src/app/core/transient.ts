import { Injector, ProviderToken, TypeProvider, inject } from '@angular/core';

/**
 * Transient dependency injection provider.
 * This will create a new instance of the provided token,
 * without making it available in sub-components
 * as would happen with providers in a component.
 * 
 * @param token the class which is injectable
 * @param injector the injector to use, if not provided, the current injector will be used.
 *     Not not necessary when using transient in the class properties construction or in the constructor,
 *     as the injector will be available in the constructor.
 *     But necessary when using transient inside anything else.
 * @returns 
 */
export function transient<T>(token: ProviderToken<T>, injector?: Injector): T {
  // make sure we have an injector
  // this will throw an error, if transient is used outside of construction and without providing an injector
  injector ??= inject(Injector);

  // create a new injector which is only meant to be used for this transient instance
  const subInjector = Injector.create({
    providers: [
      token as TypeProvider
    ],
    parent: injector
  });

  // return the instance
  return subInjector.get(token, undefined, { self: true });
}

import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, pairwise, startWith } from 'rxjs';

// This observable fires when a sub-dialog was openend and closed again
export function fireOnStartAndWhenSubDialogCloses(
  router: Router,
  route: ActivatedRoute
) {
  return router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(!!route.snapshot.firstChild),
    map(() => !!route.snapshot.firstChild),
    pairwise(),
    filter(([prevHadChild, newHasChild]) => prevHadChild && !newHasChild),
    startWith([]) // this ensures it fires once in the beginning
  );
}

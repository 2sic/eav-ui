import { ActivatedRoute } from '@angular/router';

export function calculatePathFromRoot(route: ActivatedRoute) {
  let lastChild = route;
  while (lastChild.firstChild) {
    lastChild = lastChild.firstChild;
  }
  let pathFromRoot = '';
  for (const path of lastChild.snapshot.pathFromRoot) {
    if (path.url.length <= 0) { continue; }
    for (const urlSegment of path.url) {
      if (!urlSegment.path) { continue; }
      pathFromRoot += '/' + urlSegment.path;
    }
  }
  return pathFromRoot;
}

import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ItemService } from '../../shared/store/ngrx-data/item.service';

export class FieldHelper {
  public slotIsEmpty$ = new BehaviorSubject(false);
  private subscription = new Subscription();

  constructor(entityGuid: string, isParentGroup: boolean, itemService: ItemService) {
    this.subscription.add(
      itemService.selectItemHeader(entityGuid).pipe(
        filter(header => !isParentGroup && header.Group?.SlotCanBeEmpty),
      ).subscribe(header => {
        const slotIsEmpty = header.Group.SlotIsEmpty;
        this.slotIsEmpty$.next(slotIsEmpty);
      })
    );
  }

  destroy(): void {
    this.slotIsEmpty$.complete();
    this.subscription.unsubscribe();
  }
}

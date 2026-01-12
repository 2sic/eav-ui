import { filter, fromEvent, map, tap } from "rxjs";
import { CrossWindowMessage } from "../../models/installer-models";

/**
 * Helper to listen to messages from 2sxc.org for installation purposes
 * Copied from 2sxc-ui app/installer
 * Note that it listens to all windows messages, and must filter
 * the ones from 2sxc.org with the correct moduleId
 */
export class MessagesFrom2sxc {

  constructor(private moduleId: number) {}

  alreadyProcessing = false;
  // copied from 2sxc-ui app/installer
  // Initial Observable to monitor messages
  messages$ = fromEvent(window, 'message')
  .pipe(
    tap(d => console.log('debug: received window message', d, this.moduleId)),
    // Ensure only one installation is processed.
    filter(() => !this.alreadyProcessing),
    filter((evt: MessageEvent) => evt.origin === "https://2sxc.org"),
    // Get data from event.
    map((evt: MessageEvent) => {
     try {
        return JSON.parse(evt.data) as CrossWindowMessage;
      } catch (e) {
        console.error('error procesing message. Message was ' + evt.data, e);
        return void 0;
      }
    }),
    // Check if data is valid and the moduleID matches
    filter(data => data && Number(data.moduleId) === this.moduleId),
    tap(data => console.log('debug: processed 2sxc.org message', data))
  );
}
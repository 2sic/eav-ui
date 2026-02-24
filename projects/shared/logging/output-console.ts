/**
 * Log to Console lightweight (no stack).
 * Uses a short, cryptic name log-console-internal to avoid it being used by mistake.
*/
export function consoleLogObject({ message, callStack = false, data = null }
  : { message?: any; callStack?: boolean, data?: Record<string, unknown>; }
): void {
  // Make prefix uppercase if not always
  const prefix = '🪵 ';
  message = prefix + message;

  // New lightweight log, without the entire trace / call stack
  if (callStack != true) {
    if (!data)
      return console.log(`${message}`)

    const keys = Object.keys(data);
    if (keys.length === 0)
      return console.log(`${message}`);

    if (keys.length === 1) {
      const key = keys[0];
      const show = data[key];
      if (typeof (show) === 'string')
        return console.log(`${message} [string:${show.length}] '${key}'='${show}'`);
      return console.log(`${message} [${typeof (show)}] '${key}'=`, show);
    }

    console.log(`${message} [${keys.length} data-items]`, data);
    return;
  }

  console.groupCollapsed(`${message}`, data);

  // tslint:disable-next-line:no-console
  console.trace();
  console.groupEnd();
}


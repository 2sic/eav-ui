/**
 * Idea: Most WebAPIs should return something, but it's better to return the data as a property of an envelope - like this.
 * Reason is that we may want to add more data later on, and then the client needs to be adapted after making the backend change, without
 * breaking the client in the meantime.
 * 
 * Created 2024-02-21 by 2dm, ATM not widely used.
 */
export interface RichResult {
  /** To be used when just returning a true/false result */
  ok?: boolean;

  /** Additional message, if not i18n */
  message?: string;

  /** Message key i18n to lookup in translations */
  messageKey?: string;

  /** Time taken in milliseconds */
  timeTaken?: number;
}

export interface RichResultWithData<T> extends RichResult {
  /** The actual result */
  data?: T;
}
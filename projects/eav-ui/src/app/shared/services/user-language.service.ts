import { Injectable } from "@angular/core";
import { UserPreferences } from "../user/user-preferences.service";

/**
 * This service stores and retrieves 3 different language prefrences
 * 1. current - when user changes the lang tab
 * 2. default - the set dnn default
 * 3. initial - the opened wesite (/de, /en ... etc)
 */

@Injectable({ providedIn: 'root' }) // TODO: don't use root. get with transient
export class UserLanguageService {

  constructor(private userPreferences: UserPreferences) { }

  // TODO: @2pp will store and retrieve UserPreferences about selected Langages 

}

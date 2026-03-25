import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { CryptoService } from "./crypto.service";
import { SessionStorageKeys } from "../enums/sessionStorageKeys.enum";

@Injectable({
  providedIn: "root"
})
export class SessionStorageService {

  private updated$ = new Subject<void>();

  constructor(private cryptoService: CryptoService) {}

  public setObjectItem<T>(key: string, value: T): void {
    const encryptedValue = this.cryptoService.encrypt(value);
    sessionStorage.setItem(key, encryptedValue);
    this.updated$.next();
  }

  public getObjectItem<T>(key: string): any {
    const encryptedValue = sessionStorage.getItem(key);

    if (!encryptedValue) return null;

    return this.cryptoService.decrypt<T>(encryptedValue);
  }

  public remove(key: string): void {
    sessionStorage.removeItem(key);
    this.updated$.next();
  }

  public removeSessionStorages(keys: Array<SessionStorageKeys>): void {
    keys.forEach((key) => this.remove(key));
  }

  public get valueChanges(): Observable<void> {
    return this.updated$.asObservable();
  }

  public setSessionTimer(key: string): void {
    const expiry: number = Date.now() + Math.abs(window.__env.defaultTimer) * 1000;
    const sessionTimerValue: string = this.cryptoService.encrypt(expiry.toString());
    sessionStorage.setItem(key, sessionTimerValue);
  }

  public getRemainingTime(key: string): number {
    return sessionStorage.getItem(key)
      ? (parseInt(this.cryptoService.decrypt(sessionStorage.getItem(key) ?? "")) - Date.now()) / 1000
      : 0;
  }
}
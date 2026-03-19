import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { CryptoService } from "./crypto.service";
import { LocalStorageKeys } from "../enums/localStorageKeys.enum";

@Injectable({
  providedIn: "root"
})
export class LocalStorageService {

  private updated$ = new Subject<void>();

  constructor(private cryptoService: CryptoService) {}

  public setObjectItem<T>(key: string, value: T): void {
    const encryptedValue = this.cryptoService.encrypt(value);
    localStorage.setItem(key, encryptedValue);
    this.updated$.next();
  }

  public getObjectItem<T>(key: string): T | null {
    const encryptedValue = localStorage.getItem(key);

    if (!encryptedValue) return null;

    return this.cryptoService.decrypt<T>(encryptedValue);
  }

  public remove(key: string): void {
    localStorage.removeItem(key);
    this.updated$.next();
  }

  public removeLocalStorages(keys: Array<LocalStorageKeys>): void {
    keys.forEach((key) => this.remove(key));
  }

  public get valueChanges(): Observable<void> {
    return this.updated$.asObservable();
  }
}
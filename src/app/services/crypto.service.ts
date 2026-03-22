import { Injectable } from "@angular/core";
import * as CryptoJS from "crypto-js";

@Injectable({
  providedIn: "root"
})
export class CryptoService {

  private readonly SECRET_KEY = "SandroBoggle";

  public encrypt(value: unknown): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(value),
      this.SECRET_KEY
    ).toString();
  }

  public decrypt<T>(cipherText: string): T {
    const bytes = CryptoJS.AES.decrypt(cipherText, this.SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return JSON.parse(decrypted) as T;
  }

  public encryptResponse<T>(response: string): T {
    return this.decrypt<T>(response);
  }
}